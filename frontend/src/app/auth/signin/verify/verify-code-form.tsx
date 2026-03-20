'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAppStore } from '@/hooks/use-app-store';
import { useSession } from '@/lib/luni-auth/luni-auth.provider';
import { handleApiErrors } from '@/lib/handle-api-errors';
import { wolfios } from '@/lib/wolfios/wolfios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormValues = {
  code: string;
};

interface VerifyCodeFormProps {
  email: string | null;
}

const COOLDOWN_SECONDS = 60;

export function VerifyCodeForm({ email }: Readonly<VerifyCodeFormProps>) {
  const router = useRouter();
  const { previousLink } = useAppStore();
  const session = useSession();
  const [isPendingTransition, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      code: '',
    },
  });

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.replace('/auth/signin');
    }
  }, [email, router]);

  // Start cooldown timer on mount (code was just sent)
  const startCooldown = useCallback(() => {
    setCooldown(COOLDOWN_SECONDS);

    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
    }

    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  }, []);

  // Start initial cooldown (code was sent before navigating here)
  useEffect(() => {
    startCooldown();

    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    };
  }, [startCooldown]);

  // Handle code verification
  const handleSubmit = async (values: FormValues) => {
    if (!email) {
      return;
    }

    try {
      const response = await wolfios
        .post('/api/auth/verify-code', {
          email,
          code: values.code,
        })
        .then((res) => res.data);

      // Refresh the session to update authentication state
      await session.refresh();

      // Redirect based on role or previous link
      startTransition(() => {
        if (previousLink && previousLink !== '/') {
          router.push(previousLink);
        } else {
          switch (response.role) {
            case 'ADMIN':
              router.push('/admin-area');
              break;
            case 'CUSTOMER':
              router.push('/');
              break;
            case 'HOUSEKEEPER':
              router.push('/housekeeper-area');
              break;
          }
        }
      });
    } catch (error: any) {
      // If max attempts reached, redirect back to email page
      if (error?.response?.data?.isMaxAttemptsReached) {
        toast.error('Maximum attempts reached. Please request a new code.');
        router.replace('/auth/signin');

        return;
      }

      handleApiErrors({ error, form });
    }
  };

  // Resend code
  const handleResendCode = async () => {
    if (cooldown > 0 || !email) {
      return;
    }

    try {
      await wolfios.post('/api/auth/send-code', {
        email,
      });

      form.reset();
      startCooldown();
      toast.success('New code sent to your email.');
    } catch (error) {
      handleApiErrors({ error, form });
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Enter your code</CardTitle>
          <CardDescription>
            Enter the code sent to your email address <br /> {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              form.clearErrors();
              form.handleSubmit(handleSubmit)(e);
            }}
          >
            <div className="grid gap-6">
              <FieldGroup>
                <Controller
                  name="code"
                  control={form.control}
                  rules={{ required: 'Le code est requis' }}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="flex justify-center"
                    >
                      <div className="flex justify-center">
                        <InputOTP
                          {...field}
                          maxLength={4}
                          aria-invalid={fieldState.invalid}
                          required
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Field className="m-auto w-7/12">
                  <Button
                    type="submit"
                    loading={form.formState.isSubmitting || isPendingTransition}
                  >
                    Continue
                  </Button>
                </Field>
              </FieldGroup>

              <div className="flex flex-col items-center gap-2 text-sm">
                <div className="flex flex-col gap-2 md:flex-row">
                  <p>Didn't receive a code?</p>
                  <Button
                    type="button"
                    variant="link"
                    className="text-muted-foreground h-auto p-0 font-normal underline underline-offset-4"
                    onClick={handleResendCode}
                    disabled={cooldown > 0}
                  >
                    {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
                  </Button>
                </div>
                <div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-muted-foreground h-auto p-0 font-normal underline underline-offset-4"
                    onClick={() => router.push('/auth/signin')}
                  >
                    Change email
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

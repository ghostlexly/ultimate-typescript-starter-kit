'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { handleApiErrors } from '@/lib/handle-api-errors';
import { wolfios } from '@/lib/wolfios/wolfios';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

type FormValues = {
  token: string;
};

export type ForgotPasswordVerifyFormProps = {
  email: string | null;
};

export function ForgotPasswordVerifyForm({ email }: ForgotPasswordVerifyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    defaultValues: {
      token: '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await wolfios.post('/api/auth/verify-token', {
        type: 'PASSWORD_RESET',
        email,
        token: values.token,
      });

      startTransition(() => {
        // Pass code and email to next step
        const params = new URLSearchParams();
        if (email) params.set('email', email);
        params.set('token', values.token);
        router.push(`/auth/forgot-password/reset?${params.toString()}`);
      });
    } catch (error) {
      handleApiErrors({ form, error });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verify Code</CardTitle>
          <CardDescription>
            Enter the code sent to {email || 'your email'}
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
                  name="token"
                  control={form.control}
                  rules={{ required: 'Token is required' }}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Verification Code</FieldLabel>
                      <div className="flex justify-center">
                        <InputOTP
                          {...field}
                          maxLength={6}
                          aria-invalid={fieldState.invalid}
                          required
                        >
                          <InputOTPGroup>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Field>
                  <Button
                    type="submit"
                    className="w-full"
                    loading={form.formState.isSubmitting || isPending}
                  >
                    Next
                  </Button>
                </Field>
              </FieldGroup>

              <div className="text-center text-sm">
                Didn't receive a code?{' '}
                <Button
                  variant="link"
                  className="h-auto p-0 font-normal underline underline-offset-4"
                >
                  Resend
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

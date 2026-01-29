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
import { PasswordInput } from '@/components/ui/password-input';
import { handleApiErrors } from '@/lib/handle-api-errors';
import { wolfios } from '@/lib/wolfios/wolfios';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormValues = {
  password: string;
  confirmPassword: string;
};

export type ForgotPasswordResetFormProps = {
  email: string | null;
  token: string | null;
};

export function ForgotPasswordResetForm({ email, token }: ForgotPasswordResetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      if (values.password !== values.confirmPassword) {
        form.setError('confirmPassword', {
          type: 'manual',
          message: 'Passwords do not match',
        });
        return;
      }

      await wolfios.post('/api/auth/reset-password', {
        email,
        token,
        password: values.password,
      });

      startTransition(() => {
        toast.success('Password reset successfully');
        router.push('/auth/signin');
      });
    } catch (error) {
      handleApiErrors({ form, error });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">New Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-6">
              <FieldGroup>
                <Controller
                  name="password"
                  control={form.control}
                  rules={{ required: 'Password is required' }}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        required
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={form.control}
                  rules={{ required: 'Please confirm your password' }}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                      <PasswordInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        required
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Field>
                  <Button type="submit" className="w-full" loading={isPending}>
                    Next
                  </Button>
                </Field>
              </FieldGroup>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

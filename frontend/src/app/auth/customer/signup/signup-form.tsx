'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CenteredLoadingSpinner } from '@/components/ui/centered-loading-spinner';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { QueryErrorBoundary } from '@/components/ui/query-error-boundary';
import { SingleSelectCombobox } from '@/components/ui/single-select-combobox/single-select-combobox';
import { useAppStore } from '@/hooks/use-app-store';
import { useSession } from '@/lib/luni-auth/luni-auth.provider';
import { handleApiErrors } from '@/lib/handle-api-errors';
import { wolfios } from '@/lib/wolfios/wolfios';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useFirstMount } from '@/hooks/use-first-mount';

type FormValues = {
  email: string;
  country: any | null;
  password: string;
};

export function SignUpForm({
  searchParams,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const router = useRouter();
  const { previousLink } = useAppStore();
  const session = useSession();
  const [isPendingTransition, startTransition] = useTransition();

  const countries = useQuery({
    queryKey: ['countries'],
    queryFn: () => wolfios.get('/api/countries').then((res) => res.data),
  });

  const form = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
      country: null,
    },
  });

  useFirstMount(async () => {
    const errorParam = searchParams?.error;

    if (errorParam) {
      toast.error(
        'Authentication failed. Please try again or use a different sign-in method.',
      );
    }
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      // Register
      await wolfios.post(`/api/customers/signup`, {
        email: values.email,
        password: values.password,
        role: 'CUSTOMER',
        country: values.country?.iso2Code,
      });

      // Sign in
      await wolfios
        .post('/api/auth/signin', {
          email: values.email,
          password: values.password,
          role: 'CUSTOMER',
        })
        .then((res) => res.data);

      // Refresh the session to update authentication state
      await session.refresh();

      // if previous link is provided, redirect to it
      // (ex: when the user is redirected to login page from booking page)
      startTransition(() => {
        if (previousLink && previousLink !== '/') {
          router.push(previousLink);
        } else {
          router.push('/');
        }
      });
    } catch (error) {
      handleApiErrors({ error, form });
    }
  };

  const handleGoogleSignIn = () => {
    startTransition(() => {
      router.push('/api/auth/google/customer');
    });
  };

  if (countries.isLoading) {
    return <CenteredLoadingSpinner />;
  } else if (countries.isError) {
    return <QueryErrorBoundary message={countries.error.message} />;
  }

  return (
    <div className="flex flex-col gap-6" {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Enter your information below to create your account
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
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  loading={isPendingTransition}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-background text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              <FieldGroup>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="email"
                        placeholder="m@example.com"
                        aria-invalid={fieldState.invalid}
                        required
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="country"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Where are you from?</FieldLabel>

                      <SingleSelectCombobox
                        id={field.name}
                        items={countries.data || []}
                        valueKey="iso2Code"
                        renderLabel={(item) => item.countryName}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select your country..."
                        emptyMessage="No country found. Please try again."
                        searchPlaceholder="Search..."
                        getItemKeywords={(item: any) => [item.countryName, item.iso2Code]}
                        aria-invalid={fieldState.invalid}
                      />

                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>

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

                <Field orientation="horizontal">
                  <Button
                    type="submit"
                    className="w-full"
                    loading={form.formState.isSubmitting || isPendingTransition}
                  >
                    Continue
                  </Button>
                </Field>
              </FieldGroup>

              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link href="/auth/signin" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground [&_a]:hover:text-primary text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { wolfios } from "@/lib/wolfios/wolfios";
import { handleApiErrors } from "@/lib/handle-api-errors";

type FormValues = {
  email: string;
};

export function ForgotPasswordEmailForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await wolfios.post("/api/auth/forgot-password", values);

      startTransition(() => {
        // Pass email to next step via query param
        router.push(
          `/forgot-password/verify?email=${encodeURIComponent(values.email)}`
        );
      });
    } catch (error) {
      handleApiErrors({ form, error });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address to receive a verification code
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
                  name="email"
                  control={form.control}
                  rules={{ required: "Email is required" }}
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
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
                Remember your password?{" "}
                <Link href="/signin" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

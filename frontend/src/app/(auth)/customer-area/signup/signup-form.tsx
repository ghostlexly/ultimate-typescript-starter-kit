"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CenteredLoadingSpinner } from "@/components/ui/centered-loading-spinner";
import {
  Combobox,
  ComboboxCommand,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { QueryErrorMessage } from "@/components/ui/query-error-message";
import { useAppStore } from "@/hooks/use-app-store";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { cn } from "@/lib/utils";
import { wolfios } from "@/lib/wolfios";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type FormValues = {
  email: string;
  country: { countryCode: string; countryName: string } | null;
  password: string;
};

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { previousLink } = useAppStore();
  const countries = useQuery({
    queryKey: ["countries"],
    queryFn: () => wolfios.get("/api/countries").then((res) => res.data),
  });

  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
      country: null,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      // Register
      await wolfios.post(`/api/customers/signup`, {
        email: values.email,
        password: values.password,
        role: "CUSTOMER",
        country: values.country?.countryCode,
      });

      // Sign in
      await wolfios
        .post("/api/auth/signin", {
          email: values.email,
          password: values.password,
          role: "CUSTOMER",
        })
        .then((res) => res.data);

      // if previous link is provided, redirect to it
      // (ex: when the user is redirected to login page from booking page)
      startTransition(() => {
        if (previousLink && previousLink !== "/") {
          router.push(previousLink);
        } else {
          router.push("/");
        }
      });
    } catch (error) {
      handleApiErrors({ error, form });
    }
  };

  if (countries.isLoading) {
    return <CenteredLoadingSpinner />;
  } else if (countries.isError) {
    return <QueryErrorMessage message={countries.error.message} />;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
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
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Apple
                </Button>
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="country"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Where are you from?
                      </FieldLabel>

                      <Combobox>
                        <ComboboxTrigger asChild>
                          <Button
                            id={field.name}
                            variant="outline"
                            role="combobox"
                            className="justify-between"
                            aria-invalid={fieldState.invalid}
                          >
                            {field.value ? (
                              <p>{field.value?.countryName}</p>
                            ) : (
                              <p className="text-muted-foreground">
                                Select your country...
                              </p>
                            )}
                            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                          </Button>
                        </ComboboxTrigger>
                        <ComboboxContent>
                          <ComboboxCommand>
                            <ComboboxInput placeholder="Search..." />
                            <ComboboxList>
                              <ComboboxEmpty>
                                No country found. Please try again.
                              </ComboboxEmpty>
                              <ComboboxGroup>
                                {countries.data?.map((country: any) => (
                                  <ComboboxItem
                                    key={country.countryCode}
                                    value={country.countryCode}
                                    keywords={[
                                      country.countryName,
                                      country.countryCode,
                                    ]}
                                    onSelect={(currentValue) => {
                                      if (
                                        currentValue ===
                                        field.value?.countryCode
                                      ) {
                                        field.onChange(null);
                                      } else {
                                        field.onChange({
                                          countryCode: country.countryCode,
                                          countryName: country.countryName,
                                        });
                                      }
                                    }}
                                  >
                                    <ComboboxItemIndicator
                                      checked={
                                        field.value?.countryCode ===
                                        country.countryCode
                                      }
                                    />
                                    {country.countryName}
                                  </ComboboxItem>
                                ))}
                              </ComboboxGroup>
                            </ComboboxList>
                          </ComboboxCommand>
                        </ComboboxContent>
                      </Combobox>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>

                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id={field.name}
                          type={showPassword ? "text" : "password"}
                          aria-invalid={fieldState.invalid}
                          autoComplete="current-password"
                          required
                        />
                        <InputGroupAddon align="inline-end">
                          {showPassword ? (
                            <EyeOffIcon
                              className="size-4 cursor-pointer"
                              onClick={() => setShowPassword(false)}
                            />
                          ) : (
                            <EyeIcon
                              className="size-4 cursor-pointer"
                              onClick={() => setShowPassword(true)}
                            />
                          )}
                        </InputGroupAddon>
                      </InputGroup>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Field orientation="horizontal">
                  <Button
                    type="submit"
                    className="w-full"
                    loading={form.formState.isSubmitting}
                  >
                    Continue
                  </Button>
                </Field>
              </FieldGroup>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/customer-area/signin"
                  className="underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

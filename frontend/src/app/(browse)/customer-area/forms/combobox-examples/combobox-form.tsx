"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  SingleSelectCombobox,
  SingleSelectComboboxItem,
} from "@/components/ui/single-select-combobox/single-select-combobox";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { wolfios } from "@/lib/wolfios/wolfios";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

type FormValues = {
  countryCode: SingleSelectComboboxItem | null;
};

function ComboboxForm({ customerInformations }: { customerInformations: any }) {
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const debouncedCountrySearchTerm = useDebouncedValue(countrySearchTerm, 300);

  const countries = useQuery({
    queryKey: ["demos", "paginated-countries", debouncedCountrySearchTerm],
    queryFn: () =>
      wolfios
        .get("/api/demos/paginated-countries", {
          params: {
            countryName: debouncedCountrySearchTerm,
          },
        })
        .then((res) => res.data),
  });

  const form = useForm<FormValues>({
    defaultValues: {
      countryCode: customerInformations.country
        ? {
            value: customerInformations.country.iso2Code,
            label: customerInformations.country.countryName,
          }
        : null,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await wolfios.post("/api/customer/informations", {
        countryCode: values.countryCode?.value,
      });

      toast.success("Form submitted successfully!");
    } catch (error) {
      handleApiErrors({ error, form });
    }
  };

  return (
    <Container variant={"centered"}>
      <Card>
        <CardHeader>
          <CardTitle>Combobox Form Examples</CardTitle>
          <CardDescription>
            Try out the forms with combobox ! <br />
            This form will save your country in the database and retrieve it
            automatically on refresh.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            id="combobox-form"
            onSubmit={(e) => {
              form.clearErrors();
              form.handleSubmit(handleSubmit)(e);
            }}
          >
            <FieldGroup>
              <Controller
                name="countryCode"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Where are you from?
                    </FieldLabel>

                    <SingleSelectCombobox
                      id={field.name}
                      items={countries.data?.nodes.map((country: any) => ({
                        value: country.iso2Code,
                        label: country.countryName,
                        ...country,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      onSearchChange={setCountrySearchTerm}
                      shouldFilter={false} // disable local search
                      placeholder="Select your country..."
                      emptyMessage="No country found. Please try again."
                      searchPlaceholder="Search..."
                      loading={countries.isLoading}
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation={"horizontal"}>
            <Button
              type="submit"
              form="combobox-form"
              loading={form.formState.isSubmitting}
            >
              Submit
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </Container>
  );
}

export { ComboboxForm };

'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { SingleSelectCombobox } from '@/components/ui/single-select-combobox/single-select-combobox';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { handleApiErrors } from '@/lib/handle-api-errors';
import { wolfios } from '@/lib/wolfios/wolfios';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormValues = {
  countryCode: any | null;
  city: any | null;
};

function ComboboxForm({
  countries,
  customerInformations,
}: {
  countries: any;
  customerInformations: any;
}) {
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const debouncedCitySearchTerm = useDebouncedValue(citySearchTerm, 300);

  const cities = useQuery({
    queryKey: ['demos', 'cities', debouncedCitySearchTerm],
    queryFn: () =>
      wolfios
        .get('/api/demos/cities', {
          params: {
            search: debouncedCitySearchTerm,
          },
        })
        .then((res) => res.data),
  });

  const form = useForm<FormValues>({
    defaultValues: {
      countryCode:
        countries.find(
          (country: any) => country.iso2Code === customerInformations.countryCode,
        ) ?? null,
      city: customerInformations.city ?? null,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await wolfios.patch('/api/customer/informations', {
        countryCode: values.countryCode?.iso2Code,
        city: values.city?.id,
      });

      toast.success('Form submitted successfully!');
    } catch (error) {
      handleApiErrors({ error, form });
    }
  };

  return (
    <Container variant="centered">
      <Card>
        <CardHeader>
          <CardTitle>Combobox Form Examples</CardTitle>
          <CardDescription>
            Try out the forms with combobox ! <br />
            This form will save your country and city in the database and retrieve it
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
                    <FieldLabel htmlFor={field.name}>Where are you from ?</FieldLabel>

                    <SingleSelectCombobox
                      id={field.name}
                      items={countries}
                      valueKey="iso2Code"
                      renderLabel={(item) => item.countryName}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select your country..."
                      emptyMessage="No country found. Please try again."
                      searchPlaceholder="Search..."
                      getItemKeywords={(item: any) => [item.iso2Code, item.countryName]}
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="city"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>What is your city?</FieldLabel>

                    <SingleSelectCombobox
                      id={field.name}
                      items={cities.data?.nodes || []}
                      valueKey="id"
                      renderLabel={(item) => item.name}
                      value={field.value}
                      onChange={field.onChange}
                      onSearchChange={setCitySearchTerm}
                      shouldFilter={false} // disable local search
                      placeholder="Select your city..."
                      emptyMessage="No city found. Please try again."
                      searchPlaceholder="Search..."
                      loading={cities.isLoading}
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
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

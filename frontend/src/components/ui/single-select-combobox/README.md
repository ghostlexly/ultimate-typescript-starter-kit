### Local search example

```tsx
type FormValues = {
  email: string;
  country: any | null;
  password: string;
};

const component = () => {
  const countries = useQuery({
    queryKey: ["countries"],
    queryFn: () => wolfios.get("/api/countries").then((res) => res.data),
  });

  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
      country:
        countries.find(
          (country: any) =>
            country.iso2Code === customerInformations.countryCode
        ) ?? null,
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

  return (
    <Controller
      name="country"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Where are you from?</FieldLabel>

          <SingleSelectCombobox
            id={field.name}
            items={countries.data || []}
            valueKey="countryCode"
            labelKey="countryName"
            value={field.value}
            onChange={field.onChange}
            placeholder="Select your country..."
            emptyMessage="No country found. Please try again."
            searchPlaceholder="Search..."
            getItemKeywords={(item: any) => [
              item.countryName,
              item.countryCode,
            ]}
            aria-invalid={fieldState.invalid}
          />

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
```

### Remote search example

```tsx
type FormValues = {
  email: string;
  country: any | null;
  password: string;
};

const component = () => {
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const debouncedCountrySearchTerm = useDebouncedValue(countrySearchTerm, 300);

  const countries = useQuery({
    queryKey: ["demos", "paginated-countries", debouncedCountrySearchTerm],
    queryFn: () =>
      wolfios
        .get("/api/demos/paginated-countries", {
          params: {
            countryName: debouncedCountrySearchTerm ?? undefined,
          },
        })
        .then((res) => res.data),
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
        country: values.country?.iso2Code,
      });

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

  return (
    <Controller
      name="country"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Where are you from?</FieldLabel>

          <SingleSelectCombobox
            id={field.name}
            items={countries.data?.nodes || []}
            valueKey="iso2Code"
            labelKey="countryName"
            value={field.value}
            onChange={field.onChange}
            onSearchChange={setCountrySearchTerm}
            shouldFilter={false} // disable local search
            placeholder="Select countries..."
            emptyMessage="No country found. Please try again."
            searchPlaceholder="Search..."
            loading={countries.isLoading}
            aria-invalid={fieldState.invalid}
          />

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
```

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Controller, UseFormReturn } from "react-hook-form";
import { FormValues } from "./page";
import { GhostInput } from "@/components/ui/inputs/ghost-input";

const PricesCard = ({ form }: { form: UseFormReturn<FormValues> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prix du bien</CardTitle>
        <CardDescription>
          Les prix du bien et les prix estimés doivent être le plus précis
          possible <br /> et ne doivent pas comtenir d'espaces ou de virgules
          mais uniquement des chiffres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex max-w-xl flex-col gap-4">
          <Controller
            name="price"
            control={form.control}
            render={({ field, fieldState }) => (
              <GhostInput
                {...field}
                label="Prix du bien"
                rightSection={<div>€</div>}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="coOwnershipCharges"
            control={form.control}
            render={({ field, fieldState }) => (
              <GhostInput
                {...field}
                label="Charges de copropriété"
                rightSection={<div>€/mois</div>}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="landTax"
            control={form.control}
            render={({ field, fieldState }) => (
              <GhostInput
                {...field}
                label="Taxe foncière"
                rightSection={<div>€/an</div>}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="estimatedWorkPrice"
            control={form.control}
            render={({ field, fieldState }) => (
              <GhostInput
                {...field}
                label="Montant estimé des travaux"
                rightSection={<div>€</div>}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export { PricesCard };

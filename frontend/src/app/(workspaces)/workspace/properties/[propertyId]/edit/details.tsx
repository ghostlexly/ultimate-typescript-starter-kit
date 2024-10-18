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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const DetailsCard = ({ form }: { form: UseFormReturn<FormValues> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails du bien</CardTitle>
        <CardDescription>
          Les détails du bien sont utilisés pour la présentation du bien de
          manière plus détaillée et technique.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex max-w-xl flex-col gap-4">
          <Controller
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <GhostInput
                {...field}
                label="Adresse du bien (ou ville, code postal, etc...)"
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="rooms"
            control={form.control}
            render={({ field, fieldState }) => (
              <GhostInput
                {...field}
                label="Type"
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="squareMeters"
            control={form.control}
            render={({ field, fieldState }) => (
              <GhostInput
                {...field}
                label="Surface habitable"
                rightSection={<div>m²</div>}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={form.control}
            name="freeToRent"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <label
                    className={cn(fieldState.error?.message && "text-red-500")}
                  >
                    Libre de location
                  </label>
                </div>

                {fieldState.error?.message && (
                  <div className="text-xs text-red-500">
                    {fieldState.error?.message}
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export { DetailsCard };

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

const PersonalInfosCard = ({ form }: { form: UseFormReturn<FormValues> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription>
          Les informations personnelles sont utilisées pour la présentation du
          bien et dans les notifications (sms, emails..).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex max-w-xl flex-col gap-4">
          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <GhostInput
                {...field}
                label="Nom"
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <GhostInput
                {...field}
                label="Prénom"
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <GhostInput
                {...field}
                label="Téléphone"
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <GhostInput
                {...field}
                label="Email"
                errorMessage={fieldState.error?.message}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export { PersonalInfosCard };

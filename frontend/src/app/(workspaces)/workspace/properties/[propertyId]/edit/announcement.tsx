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
import { Textarea } from "@/components/ui/textarea";
import { GhostCombobox } from "@/components/ui/inputs/ghost-combobox";

const AnnouncementCard = ({
  property,
  form,
}: {
  property: any;
  form: UseFormReturn<FormValues>;
}) => {
  const statusOptions = [
    {
      id: "AVAILABLE",
      name: "Disponible",
    },
    {
      id: "SOLD",
      name: "Vendu",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
        <CardDescription>
          Les informations générales du bien sont utilisées pour la présentation
          du bien de manière globale.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <GhostInput
                {...field}
                label="Titre de l'annonce"
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <div>
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <GhostCombobox
                  {...field}
                  label="Statut"
                  errorMessage={fieldState.error?.message}
                  isSearchable
                  options={statusOptions}
                  getOptionLabel={(option: any) => option?.name}
                  getOptionValue={(option: any) => option?.id}
                  defaultValue={() => {
                    const foundItem = statusOptions.find(
                      (listing) => listing.id === field.value
                    );

                    return foundItem;
                  }}
                  onChange={(option) => {
                    if (option) {
                      field.onChange(option.id);
                    } else {
                      field.onChange("");
                    }
                  }}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p>Description</p>
              <p className="text-xs text-gray-500">
                La description est utilisée pour la présentation du bien au
                client.
              </p>
            </div>

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  placeholder="Description"
                  errorMessage={fieldState.error?.message}
                  rows={6}
                />
              )}
            />
          </div>

          <div>
            <p>Annonce créée par</p>
            <p className="font-bold">
              {property.data?.createdBy?.email ?? "Inconnu"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { AnnouncementCard };

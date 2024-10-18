import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GhostCombobox } from "@/components/ui/inputs/ghost-combobox";
import LazyButton from "@/components/ui/lazy-button";
import { Textarea } from "@/components/ui/textarea";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { wolfios } from "@/lib/wolfios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

type FormValues = {
  content: string;
  listingId: string;
};

const NewNotificationDialog = ({ propertyId, isOpen, setIsOpen }) => {
  const form = useForm<FormValues>({
    values: {
      content: "",
      listingId: "",
    },
  });

  const queryListings = async (inputValue: string) => {
    const data = await wolfios
      .get("/api/customer/listings", {
        params: {
          name: inputValue,
        },
      })
      .then(async (res) => await res.json());

    return data.nodes;
  };

  const { mutateAsync } = useMutation({
    mutationFn: async (values: FormValues) => {
      return await wolfios.post("/api/customer/sms-notifications", {
        data: {
          ...values,
          propertyId,
        },
      });
    },

    onError: (err) => {
      handleApiErrors({ err, form });
    },

    onSuccess: () => {
      setIsOpen(false);
      toast.success("Notification envoyée avec succès.");
    },
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Création et envoi de notification</DialogTitle>
            <DialogDescription>
              Envoyez une notification SMS à tous les contacts du listing
              choisi.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await mutateAsync(values);
              } catch (err) {
                console.error(err);
              }
            })}
          >
            <div className="flex flex-col gap-4">
              <Alert variant={"info"}>
                <AlertTitle>Variables</AlertTitle>
                <AlertDescription>
                  Vous pouvez ajouter les variables suivantes dans le contenu
                  des messages : <br />
                  <span className="font-bold">{`{link}`}</span> - Lien vers le
                  bien <br />
                  <span className="font-bold">{`{lastName}`}</span> - Nom du
                  contact
                  <br />
                  <span className="font-bold">{`{firstName}`}</span> - Prénom du
                  contact <br />
                </AlertDescription>
              </Alert>

              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Textarea
                    {...field}
                    placeholder="Contenu du message SMS"
                    errorMessage={fieldState.error?.message}
                    rows={6}
                  />
                )}
              />
              <div className="flex items-start gap-1">
                <div>
                  <Info className="h-4 w-4 text-gray-500" />
                </div>
                <p className="text-xs text-gray-500">
                  Si le contenu du message est supérieur à 160 caractères, il
                  sera envoyé en plusieurs messages sur les anciens modèles de
                  smartphones.
                </p>
              </div>

              <Controller
                name="listingId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <GhostCombobox
                    {...field}
                    label="Liste de diffusion"
                    errorMessage={fieldState.error?.message}
                    isSearchable
                    loadOptions={queryListings}
                    getOptionLabel={(option) => option?.name}
                    getOptionValue={(option) => option?.id}
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

            <DialogFooter className="mt-6">
              <div className="flex justify-end gap-3">
                <DialogClose asChild>
                  <LazyButton variant={"secondary"}>
                    <div className="px-4 py-2">Fermer</div>
                  </LazyButton>
                </DialogClose>

                <LazyButton
                  type="submit"
                  variant={"primary"}
                  isLoading={form.formState.isSubmitting}
                >
                  <div className="px-4 py-2">Valider</div>
                </LazyButton>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { NewNotificationDialog };

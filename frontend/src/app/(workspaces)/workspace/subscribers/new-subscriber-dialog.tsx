import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GhostInput } from "@/components/ui/inputs/ghost-input";
import LazyButton from "@/components/ui/lazy-button";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { s3 } from "@/lib/s3";
import { wolfios } from "@/lib/wolfios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

type FormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

const NewSubscriberDialog = ({ isOpen, setIsOpen }) => {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    values: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (values: FormValues) => {
      return await wolfios.post("/api/customer/subscribers", {
        data: {
          ...values,
          email: values.email || null,
        },
      });
    },

    onError: (err) => {
      handleApiErrors({ err, form });
    },

    onSuccess: () => {
      form.reset();
      setIsOpen(false);
      toast.success("Nouveau contact créé avec succès.");
      queryClient.invalidateQueries({ queryKey: ["customer", "subscribers"] });
    },
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Création d'un nouveau contact</DialogTitle>
            <DialogDescription>
              Créez un nouveau contact en entrant ses informations personnelles
              et utilisez ses informations dans des listes de diffusion.
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
                    label="Numéro de téléphone"
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

export { NewSubscriberDialog };

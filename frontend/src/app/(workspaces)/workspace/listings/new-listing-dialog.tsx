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
  name: string;
};

const NewListingDialog = ({ isOpen, setIsOpen }) => {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    values: {
      name: "",
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (values: FormValues) => {
      return await wolfios.post("/api/customer/listings", {
        data: values,
      });
    },

    onError: (err) => {
      handleApiErrors({ err, form });
    },

    onSuccess: () => {
      form.reset();
      setIsOpen(false);
      toast.success("Nouvelle liste de diffusion créée avec succès.");
      queryClient.invalidateQueries({ queryKey: ["customer", "listings"] });
    },
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Création d'une nouvelle liste de diffusion
            </DialogTitle>
            <DialogDescription>
              Créez une nouvelle liste de diffusion, vous pourrez ensuite
              l'utiliser pour envoyer des notifications à vos abonnés. <br />{" "}
              L'ajout des abonnés à cette liste se fait dans un second temps.
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
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <GhostInput
                    {...field}
                    label="Nom de la liste de diffusion"
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

export { NewListingDialog };

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import LazyButton from "@/components/ui/lazy-button";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { wolfios } from "@/lib/wolfios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const ConfirmDeleteDialog = ({ propertyId, isOpen, setIsOpen }) => {
  const form = useForm();
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      return await wolfios
        .delete(`/api/customer/properties/${propertyId}`)
        .catch((err) => handleApiErrors({ err }));
    },

    onError: (err) => {
      handleApiErrors({ err });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "properties"] });
      toast.success("La propriété a été supprimée avec succès.");
      setIsOpen(false);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suppression d'un bien</DialogTitle>
          <DialogDescription>
            Confirmer la suppression du bien définitivement.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await mutateAsync();
            } catch (err) {
              handleApiErrors({ err });
            }
          })}
        >
          <DialogFooter className="mt-6">
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <LazyButton variant={"secondary"}>
                  <div className="px-4 py-2">Annuler</div>
                </LazyButton>
              </DialogClose>

              <LazyButton
                type="submit"
                variant={"primary"}
                isLoading={form.formState.isSubmitting}
              >
                <div className="px-4 py-2">Confirmer</div>
              </LazyButton>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { ConfirmDeleteDialog };

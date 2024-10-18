"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GhostInput } from "@/components/ui/inputs/ghost-input";
import LazyButton from "@/components/ui/lazy-button";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { wolfios } from "@/lib/wolfios";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

type FormValues = {
  phone: string;
};

const RequestPhoneDialog = ({ setSubscriber, isOpen, setIsOpen }) => {
  const form = useForm({
    values: {
      phone: "",
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (data: FormValues) => {
      return await wolfios
        .post(`/api/subscribers/phone-unlock`, {
          data: {
            phone: data.phone,
          },
        })
        .then(async (res) => await res.json());
    },

    onSuccess: (data) => {
      setSubscriber(data);
      setIsOpen(false);
    },

    onError: (err) => {
      handleApiErrors({ err, form });
    },
  });

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accès Réservé</DialogTitle>
          <DialogDescription>
            L'accès à cette page est strictement réservé. Rentrez votre numéro
            de téléphone pour accéder à la page.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(async (values: FormValues) => {
            try {
              await mutateAsync(values);
            } catch (err) {
              console.error(err);
            }
          })}
        >
          <div className="flex flex-col gap-2">
            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <GhostInput
                  {...field}
                  label="Numéro de téléphone"
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </div>

          <DialogFooter className="mt-6">
            <div className="flex justify-end gap-3">
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
  );
};

export { RequestPhoneDialog };

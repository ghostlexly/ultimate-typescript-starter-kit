"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LazyButton from "@/components/ui/lazy-button";
import { LoadingDots } from "@/components/ui/loading-dots";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { wolfios } from "@/lib/wolfios";
import { useMutation } from "@tanstack/react-query";
import { CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type FormValues = {
  propertyId: string;
};

const GenerateViewLinkDialog = ({ propertyId, isOpen, setIsOpen }) => {
  const form = useForm<FormValues>();
  const [shortLinkUrl, setShortLinkUrl] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      return await wolfios
        .post(`/api/customer/properties/${propertyId}/view-link`, {
          data: {
            ...values,
          },
        })
        .then(async (res) => await res.json());
    },

    onError: (err) => {
      handleApiErrors({ err, form });
    },

    onSuccess: (data) => {
      setShortLinkUrl(data.shortLinkUrl);
    },
  });

  // -- reset short link url when dialog is closed
  useEffect(() => {
    if (isOpen && propertyId) {
      mutateAsync({ propertyId });
    } else {
      setShortLinkUrl(null);
    }
  }, [isOpen, mutateAsync, propertyId]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Génération d'un lien de visualisation</DialogTitle>
            <DialogDescription>
              Génération d'un lien de visualisation pour le bien et le contact
              sélectionnés.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(async (values: FormValues) => {
              try {
                await mutateAsync(values);
              } catch (err) {
                handleApiErrors({ err });
              }
            })}
          >
            <div className="flex flex-col gap-4">
              {isPending && (
                <div className="flex justify-center">
                  <LoadingDots />
                </div>
              )}

              {shortLinkUrl && (
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-gray-500">
                    Lien de visualisation
                  </div>
                  <div className="relative text-sm font-medium">
                    <input
                      type="text"
                      value={shortLinkUrl}
                      className="w-full rounded-md bg-gray-100 p-2 pr-10"
                      readOnly
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        navigator.clipboard.writeText(shortLinkUrl);
                        toast.success("Lien copié dans le presse-papiers.");
                      }}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <div className="flex justify-end gap-3">
                <DialogClose asChild>
                  <LazyButton variant={"secondary"}>
                    <div className="px-4 py-2">Fermer</div>
                  </LazyButton>
                </DialogClose>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { GenerateViewLinkDialog };

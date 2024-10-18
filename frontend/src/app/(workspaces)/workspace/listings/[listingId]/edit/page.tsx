"use client";

import Container from "@/components/ui/container";
import LazyButton from "@/components/ui/lazy-button";
import { LoadingDots } from "@/components/ui/loading-dots";
import { QueryErrorMessage } from "@/components/ui/query-error-message";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { wolfios } from "@/lib/wolfios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { InformationsCard } from "./informations";

export type FormValues = {
  name: string;
};

const ListingEditPage = () => {
  const { listingId } = useParams();

  const listing = useQuery({
    queryKey: ["customer", "listings", listingId],
    queryFn: () =>
      wolfios
        .get(`/api/customer/listings/${listingId}`)
        .then(async (res) => await res.json()),
  });

  const form = useForm<FormValues>({
    values: {
      name: listing.data?.name ?? "",
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: (values: FormValues) =>
      wolfios
        .patch(`/api/customer/listings/${listingId}`, { data: values })
        .then(async (res) => await res.json()),

    onError: (err) => {
      handleApiErrors({ err: err, form });
    },

    onSuccess: (data) => {
      toast.success("Cette liste a été modifiée avec succès.");
    },
  });

  if (listing.status === "pending") {
    return (
      <div className="flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  } else if (listing.status === "error") {
    return <QueryErrorMessage />;
  }

  return (
    <Container className="my-8">
      <div className="text-2xl font-bold">
        Modification de la liste de diffusion
      </div>
      <div className="text-muted-foreground">
        Modifiez les informations de cette liste de diffusion. <br /> Tous les
        changements sont définitifs.
      </div>

      <div className="my-8" />

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
          <InformationsCard form={form} />
        </div>

        <div className="my-8" />

        <div className="flex justify-end">
          <LazyButton type="submit" isLoading={form.formState.isSubmitting}>
            <div className="flex items-center gap-2 px-8 py-2">
              <SaveIcon className="h-4 w-4" />
              <p>Enregistrer</p>
            </div>
          </LazyButton>
        </div>
      </form>
    </Container>
  );
};

export default ListingEditPage;

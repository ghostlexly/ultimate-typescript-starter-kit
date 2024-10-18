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
import { AnnouncementCard } from "./announcement";
import { DetailsCard } from "./details";
import { PricesCard } from "./prices";
import { PhotosCard } from "./photos";
import { GhostDropzoneFile } from "@/components/ui/ghost-dropzone";
import { DocumentsCard } from "./documents";
import { VideoCard } from "./video";

export type FormValues = {
  name: string;
  description: string;
  rooms: number;
  squareMeters: number;
  address: string;
  price: number;
  estimatedWorkPrice: number;
  freeToRent: boolean;
  coOwnershipCharges: number;
  landTax: number;
  status: string;
  photos: GhostDropzoneFile[];
  documents: GhostDropzoneFile[];
  video: GhostDropzoneFile[];
};

const PropertyEditPage = () => {
  const { propertyId } = useParams();

  const property = useQuery({
    queryKey: ["customer", "properties", propertyId],
    queryFn: () =>
      wolfios
        .get(`/api/customer/properties/${propertyId}`)
        .then(async (res) => await res.json()),
  });

  let propertyName = property.data?.name ?? "";

  if (propertyName.includes("Nouveau bien - Brouillon")) {
    propertyName = propertyName.replace("Nouveau bien - Brouillon", "");
  }

  const form = useForm<FormValues>({
    values: {
      name: propertyName,
      description: property.data?.description ?? "",
      rooms: property.data?.rooms ?? "",
      squareMeters: property.data?.squareMeters ?? "",
      address: property.data?.address ?? "",
      price: property.data?.price ?? "",
      estimatedWorkPrice: property.data?.estimatedWorkPrice ?? "",
      freeToRent: property.data?.freeToRent ?? false,
      coOwnershipCharges: property.data?.coOwnershipCharges ?? "",
      landTax: property.data?.landTax ?? "",
      status: property.data?.status ?? "",
      photos: property.data?.photos
        ? property.data?.photos.map((photo) => {
            return {
              id: photo.id,
              path: photo.fileName,
            };
          })
        : [],
      documents: property.data?.documents
        ? property.data?.documents.map((document) => {
            return {
              id: document.id,
              path: document.fileName,
            };
          })
        : [],
      video: property.data?.video
        ? [{ id: property.data?.video.id, path: property.data?.video.fileName }]
        : [],
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: (values: FormValues) =>
      wolfios
        .patch(`/api/customer/properties/${propertyId}`, {
          data: {
            ...values,
            photos: values.photos.map((photo) => photo.id),
            video: values.video.length > 0 ? values.video[0].id : undefined,
            documents: values.documents.map((document) => document.id),
          },
        })
        .then(async (res) => await res.json()),

    onError: (err) => {
      handleApiErrors({ err: err, form });
    },

    onSuccess: (data) => {
      toast.success("Cette annonce a été modifiée avec succès.");
    },
  });

  if (property.status === "pending") {
    return (
      <div className="flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  } else if (property.status === "error") {
    return <QueryErrorMessage />;
  }

  return (
    <Container className="my-8">
      <div className="text-2xl font-bold">Modification du bien</div>
      <div className="text-muted-foreground">
        Modifiez les informations du bien qui seront utilisées pour la
        présentation du bien. <br /> Tous les changements sont définitifs.
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
          <AnnouncementCard property={property} form={form} />

          <PhotosCard form={form} />

          <VideoCard form={form} />

          <DocumentsCard form={form} />

          <DetailsCard form={form} />

          <PricesCard form={form} />
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

export default PropertyEditPage;

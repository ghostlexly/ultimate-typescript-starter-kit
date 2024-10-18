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
import { PersonalInfosCard } from "./personal-infos";

export type FormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

const SubscriberEditPage = () => {
  const { subscriberId } = useParams();

  const subscriber = useQuery({
    queryKey: ["customer", "subscribers", subscriberId],
    queryFn: () =>
      wolfios
        .get(`/api/customer/subscribers/${subscriberId}`)
        .then(async (res) => await res.json()),
  });

  const form = useForm<FormValues>({
    values: {
      firstName: subscriber.data?.firstName ?? "",
      lastName: subscriber.data?.lastName ?? "",
      phone: subscriber.data?.phone ?? "",
      email: subscriber.data?.email ?? "",
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: (values: FormValues) =>
      wolfios
        .patch(`/api/customer/subscribers/${subscriberId}`, {
          data: {
            ...values,
            email: values.email || null,
          },
        })
        .then(async (res) => await res.json()),

    onError: (err) => {
      handleApiErrors({ err: err, form });
    },

    onSuccess: (data) => {
      toast.success("Ce contact a été modifié avec succès.");
    },
  });

  if (subscriber.status === "pending") {
    return (
      <div className="flex items-center justify-center">
        <LoadingDots />
      </div>
    );
  } else if (subscriber.status === "error") {
    return <QueryErrorMessage />;
  }

  return (
    <Container className="my-8">
      <div className="text-2xl font-bold">Modification du contact</div>
      <div className="text-muted-foreground">
        Modifiez les informations du contact qui seront utilisées dans les
        listes de diffusion. <br /> Tous les changements sont définitifs.
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
          <PersonalInfosCard form={form} />
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

export default SubscriberEditPage;

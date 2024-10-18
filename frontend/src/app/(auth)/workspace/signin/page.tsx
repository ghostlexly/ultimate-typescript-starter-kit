"use client";

import TerraCapitalLogo from "@/assets/images/terracapital.png";
import Container from "@/components/ui/container";
import { GhostImage } from "@/components/ui/ghost-image";
import { GhostInput } from "@/components/ui/inputs/ghost-input";
import LazyButton from "@/components/ui/lazy-button";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/lib/ghostlexly-auth/ghostlexly-auth.provider";
import { getSession } from "@/lib/ghostlexly-auth/ghostlexly-auth.server";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { wolfios } from "@/lib/wolfios";
import { sendGTMEvent } from "@next/third-parties/google";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { GoogleSignInButton } from "@/components/ui/project/google-signin";

type FormValues = {
  email: string;
  password: string;
};

const LoginAppPage = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const session = useSession();

  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (values: FormValues) => {
      // ------------------------------
      // Login the user
      // ------------------------------
      const userLogin = await wolfios
        .post("/api/customer/auth/signin", {
          data: { email: values.email, password: values.password },
        })
        .then(async (res) => await res.json());

      // ------------------------------
      // create the session
      // ------------------------------
      session.create({ value: userLogin.access_token });

      // ------------------------------
      // get the user session
      // ------------------------------
      const userSession = await getSession();
    },

    onError: (err) => {
      handleApiErrors({ err: err, form });
    },

    onSuccess: (data) => {
      startTransition(() => {
        router.push("/workspace");
      });
    },
  });

  return (
    <div className="h-full bg-gradient-to-br from-primary via-primary/80 to-white">
      {/* set max sizes */}
      <div className="flex h-full flex-col items-center justify-center">
        {/* wrapper */}
        <div className="flex w-full flex-col rounded-lg bg-background px-6 py-8 shadow-xl sm:w-[30rem]">
          <div className="relative h-16 w-16">
            <GhostImage
              src={TerraCapitalLogo}
              alt="Terra Capital"
              className="object-contain"
              fill
            />
          </div>
          <div className="my-2" />
          <div className="font-visbycfBold text-2xl">Connexion</div>
          Vous n'avez pas de compte ?{" "}
          <span className="font-visbycfBold underline">
            Contactez hello@fenriss.com
          </span>
          <form
            className="mt-8 flex w-full flex-col gap-6"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await mutateAsync(values);
              } catch (err) {
                console.error(err);
              }
            })}
          >
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <GhostInput
                  {...field}
                  type="email"
                  label="Email"
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <GhostInput
                  {...field}
                  label="Mot de passe"
                  type="password"
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <LazyButton
              className="mt-4 w-full"
              type="submit"
              isLoading={form.formState.isSubmitting || isPending}
            >
              <div className="flex items-center justify-center gap-2 py-2">
                <div>Se connecter</div>
              </div>
            </LazyButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginAppPage;

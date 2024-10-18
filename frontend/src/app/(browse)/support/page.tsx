"use client";

import Container from "@/components/ui/container";
import { GhostInput } from "@/components/ui/inputs/ghost-input";
import LazyButton from "@/components/ui/lazy-button";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { wolfios } from "@/lib/wolfios";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

type FormValues = {
  email: string;
  subject: string;
  message: string;
};

const SupportPage = () => {
  const form = useForm<FormValues>({
    values: {
      email: "",
      subject: "",
      message: "",
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (values: FormValues) => {
      await wolfios.post("/api/support/contact/email", { data: values });
    },

    onSuccess: (data) => {
      form.reset();
      toast.success("Message sent! \n We'll get back to you soon.", {
        duration: 15000,
      });
    },

    onError: (err) => {
      handleApiErrors({ err, form });
    },
  });

  return (
    <Container className="text-center">
      <div className="flex flex-col items-center justify-center">
        <div className="max-w-3xl text-4xl lg:text-5xl">
          Welcome to the Terra Capital Support Center!
        </div>

        <div className="max-w-xl pt-6 text-lg text-muted-foreground lg:text-xl">
          We're here to help you get the most out of our product. <br /> Whether
          you have questions, need troubleshooting assistance, or want to
          provide feedback, our dedicated team is ready to assist you.
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await mutateAsync(values);
          } catch (err) {
            console.error(err);
          }
        })}
      >
        <div className="my-6 flex justify-center">
          <div className="grid max-w-xl flex-grow grid-cols-1 gap-4">
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <GhostInput
                  label="Your e-mail address"
                  type="email"
                  {...field}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="subject"
              render={({ field, fieldState }) => (
                <GhostInput
                  label="Subject"
                  {...field}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <textarea
              {...form.register("message")}
              tabIndex={0}
              dir="auto"
              className="m-0 max-h-52 w-full resize-none overflow-y-auto border bg-transparent p-2 focus:ring-0 focus-visible:ring-0"
              placeholder="Type a message..."
              rows={4}
            />

            <LazyButton type="submit">
              <div className="px-4 py-2">Submit</div>
            </LazyButton>
          </div>
        </div>
      </form>
    </Container>
  );
};

export default SupportPage;

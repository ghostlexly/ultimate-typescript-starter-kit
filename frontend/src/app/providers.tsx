"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { getQueryClient } from "@/lib/query-client";
import { GhostlexlyAuthProvider } from "@/lib/ghostlexly-auth/ghostlexly-auth.provider";
import { LocaleProvider } from "@/providers/locale-provider";

const Providers = ({
  children,
  localeCode,
}: {
  children: React.ReactNode;
  localeCode: string;
}) => {
  const queryClient = getQueryClient();

  return (
    <>
      <LocaleProvider localeCode={localeCode}>
        <GhostlexlyAuthProvider>
          <QueryClientProvider client={queryClient}>
            <ToastContainer autoClose={5000} />

            {children}
          </QueryClientProvider>
        </GhostlexlyAuthProvider>
      </LocaleProvider>
    </>
  );
};

export { Providers };

"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { getQueryClient } from "@/lib/query-client";
import { GhostlexlyAuthProvider } from "@/lib/ghostlexly-auth/ghostlexly-auth.provider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <>
      <GhostlexlyAuthProvider>
        <QueryClientProvider client={queryClient}>
          <ToastContainer autoClose={5000} />

          {children}
        </QueryClientProvider>
      </GhostlexlyAuthProvider>
    </>
  );
};

export { Providers };

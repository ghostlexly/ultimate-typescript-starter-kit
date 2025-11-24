"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { getQueryClient } from "@/lib/query-client";
import { LuniAuthProvider } from "@/lib/luni-auth/luni-auth.provider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <LuniAuthProvider>
      <QueryClientProvider client={queryClient}>
        <ToastContainer autoClose={5000} />

        {children}
      </QueryClientProvider>
    </LuniAuthProvider>
  );
};

export { Providers };

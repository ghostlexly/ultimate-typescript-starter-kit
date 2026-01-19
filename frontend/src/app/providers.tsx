"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { getQueryClient } from "@/lib/query-client";
import {
  LuniAuthProvider,
  SessionData,
} from "@/lib/luni-auth/luni-auth.provider";

interface ProvidersProps {
  children: React.ReactNode;
  initialSession: SessionData;
}

const Providers = ({ children, initialSession }: ProvidersProps) => {
  const queryClient = getQueryClient();

  return (
    <LuniAuthProvider initialSession={initialSession}>
      <QueryClientProvider client={queryClient}>
        <ToastContainer autoClose={5000} />

        {children}
      </QueryClientProvider>
    </LuniAuthProvider>
  );
};

export { Providers };

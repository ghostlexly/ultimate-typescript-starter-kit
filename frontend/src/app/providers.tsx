"use client";

import { GhostlexlyAuthProvider } from "@/lib/ghostlexly-auth/ghostlexly-auth.provider";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const Providers = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <GhostlexlyAuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster position="top-center" />

          {children}
        </QueryClientProvider>
      </GhostlexlyAuthProvider>
    </>
  );
};

export { Providers };

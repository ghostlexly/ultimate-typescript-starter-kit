"use client";

import LazyButton from "@/components/ui/lazy-button";
import { useEffect } from "react";

const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  // log errors on Sentry...
  useEffect(() => {
    console.log(error);
  }, [error]);

  // Function to reload the page
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="flex h-dvh flex-col items-center justify-center space-y-2">
        <div className="text-2xl font-bold">Oups !</div>
        <div className="text-lg">Une erreur est survenue.</div>
        <div className="text-lg">Si le problème persiste, contactez-nous.</div>
        <div className="text-lg">Merci !</div>
        <div>
          <LazyButton onClick={handleReload}>
            <div className="px-4 py-2">Réessayer</div>
          </LazyButton>
        </div>
      </div>
    </>
  );
};

export default ErrorPage;

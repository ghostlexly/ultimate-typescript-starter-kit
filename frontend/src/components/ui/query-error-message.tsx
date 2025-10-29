import { IoAlertCircle } from "react-icons/io5";
import { Button } from "./button";

const QueryErrorMessage = ({ message }: { message?: string }) => {
  const onRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="mb-4 rounded-full bg-red-50 p-3">
        <IoAlertCircle className="size-12 text-red-500" />
      </div>

      <div className="mb-2 text-center text-xl font-bold text-gray-800">
        Oops, quelque chose s'est mal passé !
      </div>

      <div className="mb-6 text-center text-gray-600">
        {message ?? "Une erreur inconnue est survenue"}
      </div>

      <Button onClick={onRetry} variant={"destructive"}>
        <div className="px-6 py-3 font-medium text-white">Réessayer</div>
      </Button>
    </div>
  );
};

export { QueryErrorMessage };

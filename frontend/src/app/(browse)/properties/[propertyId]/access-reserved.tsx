import { AlertTriangle } from "lucide-react";
import { RequestPhoneDialog } from "./request-phone-dialog";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const AccessReservedCard = ({
  setSubscriber,
  isPhoneUnlockDialogOpen,
  setIsPhoneUnlockDialogOpen,
}) => {
  return (
    <>
      <div className="flex justify-center">
        <div className="my-4 flex flex-col items-center text-center">
          <AlertTriangle className="mb-2 h-6 w-6" strokeWidth={1.5} />
          <p className="font-visbycfBold text-xl">Accès réservé</p>
          <p>
            L'accès à cette page est strictement réservé. <br /> Rentrez votre
            numéro de téléphone pour accéder à la page.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <LoadingSpinner className="h-6 w-6" />
      </div>
      <RequestPhoneDialog
        setSubscriber={setSubscriber}
        isOpen={isPhoneUnlockDialogOpen}
        setIsOpen={setIsPhoneUnlockDialogOpen}
      />
    </>
  );
};

export { AccessReservedCard };

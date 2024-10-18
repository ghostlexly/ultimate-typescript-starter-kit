import { OpenWhatsAppButton } from "@/components/ui/project/open-whatsapp";
import { Phone } from "lucide-react";

const CallToAction = ({ property, phoneNumber }) => {
  const priceFormatter = Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <>
      <div className="flex items-center gap-4">
        <OpenWhatsAppButton
          phoneNumber={phoneNumber}
          prefiledMessage={`Bonjour, je suis intéressé par le bien ${property.data?.name} situé à ${property.data?.address} d'un prix de ${priceFormatter.format(property.data?.price)}.`}
        />

        <a
          href={`tel:${phoneNumber.replace(/\s+/g, "")}`}
          className="inline-block rounded-lg bg-black px-4 py-4 text-white hover:cursor-pointer hover:bg-black/80"
        >
          <Phone className="h-6 w-6" />
        </a>
      </div>
    </>
  );
};

export { CallToAction };

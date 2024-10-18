import { Separator } from "../separator";
import { WhatsAppLogoSvg } from "../svgs/whatsapp-logo";

const OpenWhatsAppButton = ({ prefiledMessage, phoneNumber }) => {
  const openWhatsApp = ({ prefiledMessage }) => {
    // -- rewrite the phone number without the +33 prefix and without spaces
    const transformedPhoneNumber = phoneNumber
      .replace(/\s+/g, "")
      .replace("+33", "33");

    const whatsappUrl = `https://wa.me/${transformedPhoneNumber}?text=${prefiledMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div
      className="inline-block rounded-lg bg-green-500 px-4 py-4 text-white hover:cursor-pointer hover:bg-green-400"
      onClick={() => openWhatsApp({ prefiledMessage })}
    >
      <div className="h-6 w-6">
        <WhatsAppLogoSvg />
      </div>
    </div>
  );
};

export { OpenWhatsAppButton };

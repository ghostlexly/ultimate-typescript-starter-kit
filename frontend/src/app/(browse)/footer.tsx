import TerraCapitalLogo from "@/assets/images/terracapital.png";
import { DiscordLogoSvg } from "@/components/ui/svgs/discord-logo";
import { XLogoSvg } from "@/components/ui/svgs/x-logo";
import { GhostImage } from "@/components/ui/ghost-image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="mx-auto mt-20 max-w-6xl border-t p-4">
      {/* logo */}
      <div className="my-4 flex justify-center">
        <div className="relative h-24 w-24">
          <GhostImage
            src={TerraCapitalLogo}
            alt="TerraCapital"
            className="object-contain"
            fill
          />
        </div>
      </div>

      <Separator className="my-8" />

      {/* copyright */}
      <div className="text-center text-sm text-muted-foreground">
        © 2024 Terra Capital. Tous droits réservés.
      </div>
    </footer>
  );
};

export { Footer };

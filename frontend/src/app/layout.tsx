import "@/assets/styles/globals.css";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import { GoogleTagManager } from "@next/third-parties/google";
import { CookieConsentBanner } from "@/components/ui/cookie-consent";

const visbycfMediumFont = localFont({
  src: "../assets/fonts/VisbyCF/medium.woff2",
  variable: "--font-visbycf-medium",
});

const visbycfBoldFont = localFont({
  src: "../assets/fonts/VisbyCF/bold.woff2",
  variable: "--font-visbycf-bold",
});

const aeonikProFont = localFont({
  src: "../assets/fonts/AeonikPro/medium.woff2",
  variable: "--font-aeonikpro",
});

const paytoneFont = localFont({
  src: "../assets/fonts/PaytoneOne/regular.woff2",
  variable: "--font-paytone",
});

const holeFont = localFont({
  src: "../assets/fonts/Satoshi/Hole/Satoshi-Black.woff2",
  variable: "--font-hole",
});

const libreFranklinFont = localFont({
  src: "../assets/fonts/LibreFranklin/LibreFranklin.ttf",
  variable: "--font-libre_franklin",
});

export const metadata: Metadata = {
  title:
    "Terra Capital - La référence de l'investissement immobilier à Marseille",
  description:
    "Terra Capital est une startup d'investissement immobilier à Marseille qui vous permet de devenir propriétaire sans vous soucier de la gestion locative.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <link
        rel="apple-touch-icon"
        href="/apple-touch-icon.png"
        type="image/png"
        sizes="180x180"
      />

      <body
        className={cn(
          "bg-background font-aeonikPro text-foreground antialiased",
          visbycfMediumFont.variable,
          visbycfBoldFont.variable,
          aeonikProFont.variable,
          paytoneFont.variable,
          holeFont.variable,
          libreFranklinFont.variable
        )}
      >
        <Providers>{children}</Providers>

        <CookieConsentBanner />
        {/* <GoogleTagManager gtmId="GTM-****" /> */}
      </body>
    </html>
  );
};

export default RootLayout;

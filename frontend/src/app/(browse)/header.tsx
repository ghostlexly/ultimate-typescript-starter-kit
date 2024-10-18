"use client";

import TerraCapitalLogo from "@/assets/images/terracapital.png";
import { GhostImage } from "@/components/ui/ghost-image";
import LazyButton from "@/components/ui/lazy-button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WhatsAppLogoSvg } from "@/components/ui/svgs/whatsapp-logo";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { cn } from "@/lib/utils";
import { wolfios } from "@/lib/wolfios";
import { ArrowRight, Bell, BellRing, DollarSign, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const framerFeatures = () =>
  import("@/lib/framer-features").then((res) => res.default);

const Header = () => {
  return (
    <>
      <DesktopHeader />

      <MobileHeader />
    </>
  );
};

const DesktopHeader = () => {
  const headerSize = "h-16";

  return (
    <>
      {/* container */}
      <header
        className={cn(
          "sticky top-3 z-50 mx-auto hidden w-full max-w-5xl overflow-hidden rounded-2xl bg-neutral-300/10 bg-clip-padding backdrop-blur-lg backdrop-filter lg:block",
          headerSize
        )}
      >
        {/* content of the header */}
        <div
          className={cn("grid grid-cols-3 items-center gap-6 px-4", headerSize)}
        >
          {/* menu */}
          <div>
            {/* <div className="flex gap-6">
              <Link href={"https://www.terra-capital.fr/"}>
                <span>En savoir plus</span>
              </Link>
            </div> */}
          </div>

          {/* logo */}
          <div className="justify-self-center">
            <Link href={"/"}>
              <div className="flex items-center">
                <div className="relative h-12 w-12">
                  <GhostImage
                    src={TerraCapitalLogo}
                    alt="TerraCapital"
                    className="object-contain"
                    fill
                  />
                </div>
              </div>
            </Link>
          </div>

          {/* call to action */}
          <div className="justify-self-end">
            <div className="flex gap-4">
              <Link href={"https://www.terra-capital.fr/"} target="_blank">
                <LazyButton>
                  <div className="flex items-center gap-2 px-4 py-2">
                    <WhatsAppLogoSvg className="h-4 w-4" />

                    <div className="whitespace-nowrap">Contactez-nous</div>
                  </div>
                </LazyButton>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* spacer between header and content */}
      <div className="mt-8 hidden lg:block" />
    </>
  );
};

const MobileHeader = () => {
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const router = useRouter();
  const headerSize = "h-16";

  const onMenuClick = async ({ href }: { href: string }) => {
    router.push(href);
    setSheetIsOpen(false);
  };

  return (
    <>
      {/* container */}
      <header
        className={cn(
          "sticky top-2 z-50 mx-auto w-11/12 overflow-hidden rounded-2xl bg-neutral-300/10 bg-clip-padding backdrop-blur-lg backdrop-filter lg:hidden",
          headerSize
        )}
      >
        {/* content of the header */}
        <div
          className={cn(
            "flex items-center justify-between gap-6 p-4",
            headerSize
          )}
        >
          {/* logo */}
          <div>
            <Link href={"/"}>
              <div className="relative h-12 w-12">
                <GhostImage
                  src={TerraCapitalLogo}
                  alt="TerraCapital"
                  className="object-contain"
                  fill
                />
              </div>
            </Link>
          </div>

          <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
            <SheetTrigger>
              <div className="flex cursor-pointer gap-1 rounded-lg p-2 text-secondary-foreground hover:bg-secondary">
                <MenuSvg />
                <UserMenuSvg />
              </div>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Terra Capital</SheetTitle>
              </SheetHeader>

              <div className="my-4" />

              <div className="flex flex-col gap-3">
                {/* <div
                  className="flex cursor-pointer items-center justify-between gap-3"
                  onClick={() => onMenuClick({ href: "/properties" })}
                >
                  <span>Consulter nos biens</span>
                  <ArrowRight className="h-4 w-4" />
                </div>

                <Separator /> */}

                <div
                  className="flex cursor-pointer items-center justify-between gap-3"
                  onClick={() =>
                    onMenuClick({ href: "https://www.terra-capital.fr/" })
                  }
                >
                  <span>En savoir plus</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* spacer between header and content */}
      <div className="mt-8 lg:hidden" />
    </>
  );
};

function MenuSvg() {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      version="1.1"
    >
      <path
        d="M19.15 6.85H4.85a.76.76 0 0 1-.75-.75c0-.41.34-.75.75-.75h14.3c.41 0 .75.34.75.75s-.34.75-.75.75Zm0 5.76H4.85a.76.76 0 0 1-.75-.75c0-.41.34-.75.75-.75h14.3c.41 0 .75.34.75.75s-.34.75-.75.75Zm0 6.01H4.85a.76.76 0 0 1-.75-.75c0-.41.34-.75.75-.75h14.3c.41 0 .75.34.75.75s-.34.75-.75.75Z"
        fill="currentColor"
      ></path>
    </svg>
  );
}

function UserMenuSvg() {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      version="1.1"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.368 18.847a9.575 9.575 0 0 0 6.592 2.624 9.573 9.573 0 0 0 6.488-2.527c-2.387-3.465-6.419-3.5-6.485-3.5a4.957 4.957 0 0 1-4.954-4.951 4.957 4.957 0 0 1 4.95-4.951 4.956 4.956 0 0 1 4.193 7.587.625.625 0 0 1-1.058-.666 3.705 3.705 0 0 0-3.134-5.671 3.705 3.705 0 0 0-3.701 3.701 3.705 3.705 0 0 0 3.7 3.701c.183-.022 4.597.018 7.369 3.83a9.569 9.569 0 0 0 2.242-6.164c0-5.298-4.311-9.61-9.61-9.61-5.299 0-9.61 4.312-9.61 9.61 0 2.292.807 4.4 2.151 6.054.887-1.178 2.042-1.989 2.909-2.483a.625.625 0 0 1 .62 1.085c-.807.459-1.892 1.225-2.662 2.33Zm14.38.575a.62.62 0 0 1-.104.106 10.826 10.826 0 0 1-7.684 3.193c-5.988 0-10.86-4.872-10.86-10.861C1.1 5.872 5.972 1 11.96 1c5.988 0 10.86 4.872 10.86 10.86 0 2.937-1.172 5.605-3.072 7.562Z"
        fill="currentColor"
      ></path>
    </svg>
  );
}

export { Header };

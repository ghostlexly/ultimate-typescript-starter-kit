"use client";

import TerraCapitalLogo from "@/assets/images/terracapital.png";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import Link from "next/link";
import { GhostImage } from "@/components/ui/ghost-image";

const AppHeader = () => {
  const pathname = usePathname();
  const isHeaderHidden =
    !pathname.match(/^\/workspace\/conversation\/new$/) &&
    pathname.match(/^\/workspace\/conversation\//);
  const headerSize = "h-12";
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      {/* mobile */}
      {!isHeaderHidden && (
        <div
          className={cn(
            "sticky top-2 z-50 mx-auto w-11/12 overflow-hidden rounded-2xl border-b bg-background/10 bg-clip-padding backdrop-blur-lg backdrop-filter lg:hidden",
            headerSize
          )}
        >
          {/* content of the header */}
          <div
            className={cn(
              "grid grid-cols-3 items-center gap-6 px-4",
              headerSize
            )}
          >
            {/* menu */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <div className="flex items-center">
                  <MenuSvg />
                  <UserMenuSvg />
                </div>
              </SheetTrigger>
              <SheetContent
                side={"left"}
                className="border-r-black p-0"
                classNames={{
                  sheetClose: "focus:ring-0 focus:ring-offset-0",
                }}
              >
                <Sidebar onNavigate={() => setIsSheetOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* logo */}
            <div className="justify-self-center">
              <Link href={"/admin"}>
                <div className="relative h-10 w-10">
                  <GhostImage
                    src={TerraCapitalLogo}
                    alt="Terra Capital"
                    className="object-contain"
                    fill
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MenuSvg = () => {
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
};

const UserMenuSvg = () => {
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
};

export { AppHeader };

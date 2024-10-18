"use client";

import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader } from "./sheet";
import { useSession } from "@/lib/ghostlexly-auth/ghostlexly-auth.provider";
import { destroyCart } from "@/actions/cart.actions";
import { Separator } from "./separator";

export type DrawerItemType = {
  type: "item" | "divider";
  label?: string;
  href?: string;
  icon?: ReactNode;
};

type DrawerLayoutProps = {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  drawerItems: DrawerItemType[];
  side?: "left" | "right" | "top" | "bottom";
};

const DrawerLayout: React.FC<DrawerLayoutProps> = ({
  drawerOpen,
  setDrawerOpen,
  drawerItems,
  side = "right",
}) => {
  const router = useRouter();
  const session = useSession();

  const handleClose = () => {
    setDrawerOpen(false);
  };

  const handleItemClick = (href: string | undefined) => {
    if (href === "/logout") {
      session.destroy();
      destroyCart();
      router.push("/");
      handleClose();
      return;
    }

    if (href) {
      router.push(href);
    }

    handleClose();
  };

  return (
    <Sheet open={drawerOpen} onOpenChange={handleClose}>
      <SheetContent side={side}>
        <SheetHeader className="h-4"></SheetHeader>

        {/* BODY */}
        <div>
          {drawerItems.map((item: DrawerItemType, index) => {
            switch (item.type) {
              case "divider":
                return <Separator key={index} />;
              case "item":
                return (
                  <div key={index}>
                    <div
                      className="relative flex flex-grow cursor-pointer items-center"
                      onClick={() => handleItemClick(item.href)}
                    >
                      <div className="inline-flex w-12 flex-shrink-0 text-black">
                        {item.icon}
                      </div>
                      <div className="my-4 flex-1">{item.label}</div>
                    </div>
                  </div>
                );
            }
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DrawerLayout;

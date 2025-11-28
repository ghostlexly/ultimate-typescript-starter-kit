"use client";

import * as React from "react";

import { SidebarNav, SidebarNavItem } from "@/components/ui/sidebar-nav";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  ...props
}: {
  items: SidebarNavItem[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel>Secondary</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarNav items={items} />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

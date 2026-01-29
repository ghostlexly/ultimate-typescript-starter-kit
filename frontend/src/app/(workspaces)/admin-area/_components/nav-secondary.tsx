'use client';

import * as React from 'react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { SidebarNav, SidebarNavItem } from '@/components/ui/sidebar-nav';

export function NavSecondary({
  items,
  ...props
}: {
  items: SidebarNavItem[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel>Secondary</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarNav items={items} />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

'use client';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { IconCirclePlusFilled, IconMail } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { SidebarNav, type SidebarNavItem } from '@/components/ui/sidebar-nav';

export function NavMain({ items }: { items: SidebarNavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center gap-2">
          <SidebarMenuButton
            tooltip="Quick Create"
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
          >
            <IconCirclePlusFilled />
            <span>Quick Create</span>
          </SidebarMenuButton>
          <Button
            size="icon"
            className="size-8 group-data-[collapsible=icon]:opacity-0"
            variant="outline"
          >
            <IconMail />
            <span className="sr-only">Inbox</span>
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarNav items={items} />
    </SidebarGroup>
  );
}

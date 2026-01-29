'use client';

import React, { useState } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Icon } from '@tabler/icons-react';

export type SidebarNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon | Icon;
  isActive?: boolean;
  exact?: boolean; // If true, only exact URL match will be active
  badge?: React.ReactNode;
  tooltip?: string;
  items?: {
    title: string;
    url: string;
    exact?: boolean;
    badge?: React.ReactNode;
  }[];
};

export type SidebarNavProps = {
  items: SidebarNavItem[];
};

// Check if a URL matches the current pathname
function isUrlActive(pathname: string, url: string, exact?: boolean) {
  if (url === '#') return false;
  if (exact) return pathname === url;
  // Exact match or prefix match for nested routes
  return pathname === url || pathname.startsWith(url + '/');
}

// Check if any sub-item is active
function hasActiveSubItem(
  pathname: string,
  subItems?: { url: string; exact?: boolean }[],
) {
  return (
    subItems?.some((subItem) => isUrlActive(pathname, subItem.url, subItem.exact)) ??
    false
  );
}

// Collapsible menu item component with controlled state
function CollapsibleNavItem({
  item,
  pathname,
  onLinkClick,
}: {
  item: SidebarNavItem;
  pathname: string;
  onLinkClick: () => void;
}) {
  const isSubActive = hasActiveSubItem(pathname, item.items);
  const [isOpen, setIsOpen] = useState(isSubActive || item.isActive || false);
  const tooltipText = item.tooltip ?? item.title;

  // Show active style only when sub-item is active AND collapsible is closed
  const showActiveStyle = isSubActive && !isOpen;

  return (
    <Collapsible
      asChild
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={tooltipText} isActive={showActiveStyle}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <Link href={subItem.url} key={subItem.title} onClick={onLinkClick}>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isUrlActive(pathname, subItem.url, subItem.exact)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{subItem.title}</span>
                      {subItem.badge && subItem.badge}
                    </div>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </Link>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function SidebarNav({ items }: SidebarNavProps) {
  const { setOpenMobile, isMobile } = useSidebar();
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu>
      {items.map((item) => {
        const hasSubItems = item.items && item.items.length > 0;
        const tooltipText = item.tooltip ?? item.title;
        const isActive = item.isActive ?? isUrlActive(pathname, item.url, item.exact);

        if (!hasSubItems) {
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={tooltipText}>
                <Link href={item.url} onClick={handleLinkClick}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }

        return (
          <CollapsibleNavItem
            key={item.title}
            item={item}
            pathname={pathname}
            onLinkClick={handleLinkClick}
          />
        );
      })}
    </SidebarMenu>
  );
}

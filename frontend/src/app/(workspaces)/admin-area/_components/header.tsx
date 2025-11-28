"use client";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { useState, useEffect } from "react";

export function Header() {
  const { breadcrumbs } = useBreadcrumb();
  const [isLoading, setIsLoading] = useState(true);

  // The breadcrumbs are empty on the first SSR load,
  // so we need to wait for the client to load them
  // Until then, we show a skeleton
  useEffect(() => {
    setIsLoading(false);
  }, [breadcrumbs]);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="sm:hidden -ml-1" />

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            {isLoading && breadcrumbs.length === 0 ? (
              <>
                <BreadcrumbItem>
                  <Skeleton className="h-4 w-16" />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Skeleton className="h-4 w-16" />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Skeleton className="h-4 w-16" />
                </BreadcrumbItem>
              </>
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/admin-area">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.length > 0 && <BreadcrumbSeparator />}
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href || index} className="contents">
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href!}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index !== breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator />
                    )}
                  </div>
                ))}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {isLoading && breadcrumbs.length === 0 ? (
          <Skeleton className="h-5 w-32 sm:hidden" />
        ) : (
          <h1 className="text-base font-semibold sm:hidden">
            {breadcrumbs.length > 0
              ? breadcrumbs[breadcrumbs.length - 1].label
              : "Dashboard"}
          </h1>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="size-5" />
            <span className="sr-only">Notifications</span>
            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
          </Button>
        </div>
      </div>
    </header>
  );
}

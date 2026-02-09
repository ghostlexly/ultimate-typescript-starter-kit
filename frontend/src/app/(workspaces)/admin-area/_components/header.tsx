'use client';

import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BellIcon, ChevronLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { useRouter } from 'next/navigation';

export function Header() {
  const { breadcrumbs } = useBreadcrumb();
  const router = useRouter();

  return (
    <header className="bg-background/40 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1 sm:hidden" />

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground -ml-2 hidden h-8 w-8 sm:flex"
          onClick={() => router.back()}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <div key={crumb.href || index} className="contents">
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-bold">{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href!}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="size-5" />
            <span className="sr-only">Notifications</span>
            <span className="bg-primary absolute top-2 right-2 size-2 rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}

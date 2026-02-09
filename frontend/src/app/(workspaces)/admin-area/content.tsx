'use client';

import { ChartAreaInteractive } from '@/app/(workspaces)/admin-area/_components/chart-area-interactive';
import { DataTable } from '@/app/(workspaces)/admin-area/_components/data-table';
import { SectionCards } from '@/app/(workspaces)/admin-area/_components/section-cards';
import { Container } from '@/components/ui/container';
import data from './data.json';
import { useSetBreadcrumbs } from '@/hooks/use-breadcrumb';
import {
  ProtectedRouteExample,
  ProtectedRouteExampleContent,
} from '@/app/(workspaces)/admin-area/protected-route-example';

export function Content() {
  useSetBreadcrumbs([
    {
      href: '#',
      label: 'Dashboard',
    },
  ]);

  return (
    <Container>
      <div className="flex flex-col gap-6">
        <SectionCards />

        <ChartAreaInteractive />

        <DataTable data={data} />

        <ProtectedRouteExample>
          <ProtectedRouteExampleContent />
        </ProtectedRouteExample>
      </div>
    </Container>
  );
}

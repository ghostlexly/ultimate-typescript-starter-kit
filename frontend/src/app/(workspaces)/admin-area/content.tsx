'use client';

import { ChartAreaInteractive } from '@/app/(workspaces)/admin-area/_components/chart-area-interactive';
import { DataTable } from '@/app/(workspaces)/admin-area/_components/data-table';
import { SectionCards } from '@/app/(workspaces)/admin-area/_components/section-cards';
import { Container } from '@/components/ui/container';
import data from './data.json';
import { wolfios } from '@/lib/wolfios/wolfios';
import { Button } from '@/components/ui/button';
import { useSetBreadcrumbs } from '@/hooks/use-breadcrumb';

export function Content() {
  useSetBreadcrumbs([
    {
      href: '#',
      label: 'Dashboard',
    },
  ]);

  const handleProtectedRoute = async () => {
    await wolfios.get('/api/demos/protected-route').then((res) => {
      console.log(res.data);
      console.log('A protected route has been successfully accessed.');
    });
  };
  return (
    <Container>
      <div className="flex flex-col gap-6">
        <SectionCards />

        <ChartAreaInteractive />

        <DataTable data={data} />

        <div>
          <Button onClick={handleProtectedRoute}>Test Protected Route</Button>
        </div>
      </div>
    </Container>
  );
}

import { ChartAreaInteractive } from "@/app/(workspaces)/admin-area/_components/chart-area-interactive";
import { DataTable } from "@/app/(workspaces)/admin-area/_components/data-table";
import { SectionCards } from "@/app/(workspaces)/admin-area/_components/section-cards";

import data from "./data.json";
import { Container } from "@/components/ui/container";

export default function Page() {
  return (
    <Container>
      <div className="flex flex-col gap-6">
        <SectionCards />

        <ChartAreaInteractive />

        <DataTable data={data} />
      </div>
    </Container>
  );
}

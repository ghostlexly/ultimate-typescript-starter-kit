"use client";

import { ChartAreaInteractive } from "@/app/(workspaces)/admin-area/_components/chart-area-interactive";
import { DataTable } from "@/app/(workspaces)/admin-area/_components/data-table";
import { SectionCards } from "@/app/(workspaces)/admin-area/_components/section-cards";

import data from "./data.json";
import { Container } from "@/components/ui/container";
import { wolfios } from "@/lib/wolfios/wolfios";
import { Button } from "@/components/ui/button";

export default function Page() {
  const test = async () => {
    await wolfios
      .get("/api/demos/protected-route")
      .then(() =>
        console.log("A protected route has been successfully accessed.")
      );
  };

  return (
    <Container>
      <div className="flex flex-col gap-6">
        <SectionCards />

        <ChartAreaInteractive />

        <DataTable data={data} />

        <div>
          <Button onClick={test}>Click here</Button>
        </div>
      </div>
    </Container>
  );
}

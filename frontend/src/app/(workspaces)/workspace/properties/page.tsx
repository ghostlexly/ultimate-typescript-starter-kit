"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Container from "@/components/ui/container";
import LazyButton from "@/components/ui/lazy-button";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PropertiesTable from "./properties-table";
import { wolfios } from "@/lib/wolfios";

const PropertiesPage = () => {
  const router = useRouter();

  const createNewProperty = async () => {
    const data = await wolfios
      .post("/api/customer/properties", {
        data: {
          name: "Nouveau bien - Brouillon",
        },
      })
      .then(async (res) => await res.json());

    router.push(`/workspace/properties/${data.id}/edit`);
  };

  return (
    <>
      <Container className="my-8">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des biens</CardTitle>
            <CardDescription>
              Gérez vos biens en les recherchant par plusieurs critères.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-end">
              <LazyButton
                onClick={() => createNewProperty()}
                variant={"secondary"}
              >
                <div className="flex items-center gap-2 px-6 py-2">
                  <PlusIcon className="h-4 w-4" />
                  <span>Nouveau bien</span>
                </div>
              </LazyButton>
            </div>

            <PropertiesTable />
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default PropertiesPage;

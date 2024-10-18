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
import { NewListingDialog } from "./new-listing-dialog";
import { ListingsTable } from "./listings-table";

const ListingsPage = () => {
  const router = useRouter();
  const [newSubscriberDialogIsOpen, setNewSubscriberDialogIsOpen] =
    useState(false);

  return (
    <>
      <Container className="my-8">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des listes de diffusion</CardTitle>
            <CardDescription>
              Gérez vos listes de diffusion en les recherchant par plusieurs
              critères.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-end">
              <LazyButton
                onClick={() => {
                  setNewSubscriberDialogIsOpen(true);
                }}
                variant={"secondary"}
              >
                <div className="flex items-center gap-2 px-6 py-2">
                  <PlusIcon className="h-4 w-4" />
                  <span>Nouvelle liste de diffusion</span>
                </div>
              </LazyButton>
            </div>

            <ListingsTable />
          </CardContent>
        </Card>
      </Container>

      <NewListingDialog
        isOpen={newSubscriberDialogIsOpen}
        setIsOpen={setNewSubscriberDialogIsOpen}
      />
    </>
  );
};

export default ListingsPage;

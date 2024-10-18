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
import { NewSubscriberDialog } from "./new-subscriber-dialog";
import { SubscribersTable } from "./subscribers-table";

const PropertiesPage = () => {
  const router = useRouter();
  const [newSubscriberDialogIsOpen, setNewSubscriberDialogIsOpen] =
    useState(false);

  return (
    <>
      <Container className="my-8">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des contacts</CardTitle>
            <CardDescription>
              Gérez vos contacts en les recherchant par plusieurs critères.
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
                  <span>Nouveau contact</span>
                </div>
              </LazyButton>
            </div>

            <SubscribersTable />
          </CardContent>
        </Card>
      </Container>

      <NewSubscriberDialog
        isOpen={newSubscriberDialogIsOpen}
        setIsOpen={setNewSubscriberDialogIsOpen}
      />
    </>
  );
};

export default PropertiesPage;

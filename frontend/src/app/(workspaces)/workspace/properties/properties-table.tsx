"use client";

import { GhostImage } from "@/components/ui/ghost-image";
import { columnHelper, GhostTable } from "@/components/ui/ghost-table";
import { s3 } from "@/lib/s3";
import { wolfios } from "@/lib/wolfios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle, Eye, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BiSolidEdit } from "react-icons/bi";
import { NewNotificationDialog } from "./new-notification-dialog";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { GenerateViewLinkDialog } from "./generate-view-link-dialog";

const PropertiesTable = () => {
  const [newNotificationDialogIsOpen, setNewNotificationDialogIsOpen] =
    useState(false);
  const [confirmDeleteDialogIsOpen, setConfirmDeleteDialogIsOpen] =
    useState(false);
  const [generateViewLinkDialogIsOpen, setGenerateViewLinkDialogIsOpen] =
    useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );

  const [pagination, setPagination] = useState({
    pageIndex: 1, //initial page index
    pageSize: 50, //default page size
  });
  const [filters, setFilters] = useState<any>();
  const priceFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  // ------------------
  // Load
  // ------------------
  const { data, status } = useQuery({
    queryKey: [
      "customer",
      "properties",
      JSON.stringify(pagination),
      JSON.stringify(filters),
    ],
    queryFn: () =>
      wolfios
        .get("/api/customer/properties", {
          params: {
            page: pagination.pageIndex,
            first: pagination.pageSize,
            ...filters,
          },
        })
        .then(async (res) => await res.json()),
  });

  return (
    <>
      <GhostTable
        data={data?.nodes || []}
        isLoading={status === "pending"}
        setFilters={setFilters}
        pagination={pagination}
        setPagination={setPagination}
        pagesCount={data?.pagination?.pagesCount || 1}
        columns={[
          columnHelper.accessor((row) => row.photos, {
            id: "photos",
            header: "#",
            enableColumnFilter: false,
            enableSorting: false,
            cell: (props) => {
              const value = props.getValue();

              if (!value || value.length === 0) {
                return "-";
              }

              return (
                <div className="relative size-20 overflow-hidden rounded-lg">
                  <GhostImage
                    src={s3.getDomainName() + value[0].fileKey}
                    alt="Photo du bien"
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              );
            },
          }),

          columnHelper.accessor((row) => row.createdAt, {
            id: "createdAt",
            header: "Date de création",
            enableColumnFilter: false,
            cell: (props) => {
              const value = props.getValue();

              return format(value, "dd/MM/yyyy HH:mm");
            },
          }),

          columnHelper.accessor((row) => row.name, {
            id: "name",
            header: "Nom du bien",
          }),

          columnHelper.accessor((row) => row.address, {
            id: "address",
            header: "Adresse",
          }),

          columnHelper.accessor((row) => row.price, {
            id: "price",
            header: "Prix du bien",
            cell: (props) => {
              const value = props.getValue();

              if (!value) {
                return "-";
              }

              return priceFormatter.format(value).replace(",", ".");
            },
          }),

          columnHelper.accessor("actions", {
            header: "Actions",
            enableColumnFilter: false,
            enableSorting: false,
            cell: (props) => (
              <div className="flex items-center gap-2">
                <Link
                  href={`/workspace/properties/${props.row.original.id}/edit`}
                >
                  <BiSolidEdit className="h-5 w-5" />
                </Link>

                <div
                  className="hover:cursor-pointer"
                  onClick={() => {
                    setSelectedPropertyId(props.row.original.id);
                    setNewNotificationDialogIsOpen(true);
                  }}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div
                  className="hover:cursor-pointer"
                  onClick={() => {
                    setSelectedPropertyId(props.row.original.id);
                    setGenerateViewLinkDialogIsOpen(true);
                  }}
                >
                  <Eye className="h-5 w-5" />
                </div>

                <div
                  className="hover:cursor-pointer"
                  onClick={() => {
                    setSelectedPropertyId(props.row.original.id);
                    setConfirmDeleteDialogIsOpen(true);
                  }}
                >
                  <Trash className="h-5 w-5" />
                </div>
              </div>
            ),
          }),
        ]}
      />

      <ConfirmDeleteDialog
        propertyId={selectedPropertyId}
        isOpen={confirmDeleteDialogIsOpen}
        setIsOpen={setConfirmDeleteDialogIsOpen}
      />

      <NewNotificationDialog
        propertyId={selectedPropertyId}
        isOpen={newNotificationDialogIsOpen}
        setIsOpen={setNewNotificationDialogIsOpen}
      />

      <GenerateViewLinkDialog
        propertyId={selectedPropertyId}
        isOpen={generateViewLinkDialogIsOpen}
        setIsOpen={setGenerateViewLinkDialogIsOpen}
      />
    </>
  );
};

export default PropertiesTable;

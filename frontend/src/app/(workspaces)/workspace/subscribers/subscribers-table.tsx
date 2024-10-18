"use client";

import { columnHelper, GhostTable } from "@/components/ui/ghost-table";
import { wolfios } from "@/lib/wolfios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { BookUser, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BiSolidEdit } from "react-icons/bi";
import { AttachListingDialog } from "./attach-listing.dialog";
import { handleApiErrors } from "@/lib/handle-api-errors";

const SubscribersTable = () => {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    pageIndex: 1, //initial page index
    pageSize: 50, //default page size
  });
  const [filters, setFilters] = useState<any>();
  const [isAttachListingDialogOpen, setIsAttachListingDialogOpen] =
    useState(false);
  const [selectedSubscriberId, setSelectedSubscriberId] = useState<
    string | null
  >(null);
  const priceFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  const deleteSubscriber = async (subscriberId: string) => {
    await wolfios
      .delete(`/api/customer/subscribers/${subscriberId}`)
      .catch((err) => {
        handleApiErrors({ err });
      });

    queryClient.invalidateQueries({ queryKey: ["customer", "subscribers"] });
  };

  // ------------------
  // Load
  // ------------------
  const { data, status } = useQuery({
    queryKey: [
      "customer",
      "subscribers",
      JSON.stringify(pagination),
      JSON.stringify(filters),
    ],
    queryFn: () =>
      wolfios
        .get("/api/customer/subscribers", {
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
          columnHelper.accessor((row) => row.createdAt, {
            id: "createdAt",
            header: "Date de création",
            enableColumnFilter: false,
            cell: (props) => {
              const value = props.getValue();

              return format(value, "dd/MM/yyyy HH:mm");
            },
          }),

          columnHelper.accessor((row) => row.fullName, {
            id: "fullName",
            header: "Nom et prénom",
            cell: (props) => (
              <>
                <div className="uppercase">{props.row.original.lastName}</div>
                <div className="capitalize">{props.row.original.firstName}</div>
              </>
            ),
          }),

          columnHelper.accessor((row) => row.phone, {
            id: "phone",
            header: "Téléphone",
          }),

          columnHelper.accessor("actions", {
            header: "Actions",
            enableColumnFilter: false,
            enableSorting: false,
            cell: (props) => (
              <div className="flex items-center gap-2">
                <Link
                  href={`/workspace/subscribers/${props.row.original.id}/edit`}
                >
                  <BiSolidEdit className="h-5 w-5" />
                </Link>

                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedSubscriberId(props.row.original.id);
                    setIsAttachListingDialogOpen(true);
                  }}
                >
                  <BookUser className="h-5 w-5" />
                </div>

                <div
                  className="cursor-pointer"
                  onClick={() => deleteSubscriber(props.row.original.id)}
                >
                  <Trash className="h-5 w-5" />
                </div>
              </div>
            ),
          }),
        ]}
      />

      <AttachListingDialog
        subscriberId={selectedSubscriberId}
        isOpen={isAttachListingDialogOpen}
        setIsOpen={setIsAttachListingDialogOpen}
      />
    </>
  );
};

export { SubscribersTable };

"use client";

import { columnHelper, GhostTable } from "@/components/ui/ghost-table";
import { wolfios } from "@/lib/wolfios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { PlusIcon, Trash, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BiSolidEdit } from "react-icons/bi";
import { AttachSubscriberDialog } from "./attach-subscriber.dialog";
import { handleApiErrors } from "@/lib/handle-api-errors";

const ListingsTable = () => {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState({
    pageIndex: 1, //initial page index
    pageSize: 50, //default page size
  });
  const [filters, setFilters] = useState<any>();
  const [attachSubscriberDialogIsOpen, setAttachSubscriberDialogIsOpen] =
    useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );

  const { mutateAsync: deleteListing } = useMutation({
    mutationFn: async (id: string) => {
      return await wolfios.delete(`/api/customer/listings/${id}`);
    },

    onError: (err) => {
      handleApiErrors({ err });
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["customer", "listings"],
      });
    },
  });

  // ------------------
  // Load
  // ------------------
  const { data, status } = useQuery({
    queryKey: [
      "customer",
      "listings",
      JSON.stringify(pagination),
      JSON.stringify(filters),
    ],
    queryFn: () =>
      wolfios
        .get("/api/customer/listings", {
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

          columnHelper.accessor((row) => row.name, {
            id: "name",
            header: "Nom",
          }),

          columnHelper.accessor("actions", {
            header: "Actions",
            enableColumnFilter: false,
            enableSorting: false,
            cell: (props) => (
              <div className="flex items-center gap-2">
                <Link
                  href={`/workspace/listings/${props.row.original.id}/edit`}
                >
                  <BiSolidEdit className="h-5 w-5" />
                </Link>

                <div
                  className="hover:cursor-pointer"
                  onClick={() => {
                    setAttachSubscriberDialogIsOpen(true);
                    setSelectedListingId(props.row.original.id);
                  }}
                >
                  <UserPlus className="h-5 w-5" />
                </div>

                <div
                  className="cursor-pointer"
                  onClick={() => {
                    deleteListing(props.row.original.id);
                  }}
                >
                  <Trash className="h-5 w-5" />
                </div>
              </div>
            ),
          }),
        ]}
      />

      <AttachSubscriberDialog
        isOpen={attachSubscriberDialogIsOpen}
        setIsOpen={setAttachSubscriberDialogIsOpen}
        listingId={selectedListingId}
      />
    </>
  );
};

export { ListingsTable };

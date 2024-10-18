import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { columnHelper, GhostTable } from "@/components/ui/ghost-table";
import LazyButton from "@/components/ui/lazy-button";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { wolfios } from "@/lib/wolfios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type FormValues = {
  subscriberIds: string[];
};

const AttachSubscriberDialog = ({ listingId, isOpen, setIsOpen }) => {
  const [filters, setFilters] = useState<any>();
  const [pagination, setPagination] = useState({
    pageIndex: 1, //initial page index
    pageSize: 50, //default page size
  });
  const queryClient = useQueryClient();
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(
    new Set()
  );

  const form = useForm<FormValues>({
    values: {
      subscriberIds: Array.from(selectedSubscribers),
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (values: FormValues) => {
      return await wolfios.patch(
        `/api/customer/listings/${listingId}/attach-subscribers`,
        {
          data: values,
        }
      );
    },

    onError: (err) => {
      handleApiErrors({ err });
    },

    onSuccess: () => {
      setIsOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["customer", "listings", listingId],
      });
      toast.success("Les contacts ont été attachés à la liste de diffusion");
    },
  });

  const handleSubscriberSelection = useCallback((subscriberId: string) => {
    setSelectedSubscribers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subscriberId)) {
        newSet.delete(subscriberId);
      } else {
        newSet.add(subscriberId);
      }
      return newSet;
    });
  }, []);

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attacher un contact</DialogTitle>
          <DialogDescription>
            Attachez un ou plusieurs contacts à cette liste de diffusion.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await mutateAsync(values);
            } catch (err) {
              handleApiErrors({ err });
            }
          })}
        >
          <div>
            <GhostTable
              data={data?.nodes || []}
              isLoading={status === "pending"}
              setFilters={setFilters}
              pagination={pagination}
              setPagination={setPagination}
              pagesCount={data?.pagination?.pagesCount || 1}
              columns={[
                columnHelper.accessor("id", {
                  id: "select",
                  header: "#",
                  enableColumnFilter: false,
                  enableSorting: false,
                  cell: ({ row }) => (
                    <Checkbox
                      checked={selectedSubscribers.has(row.original.id)}
                      onCheckedChange={() =>
                        handleSubscriberSelection(row.original.id)
                      }
                      aria-label="Select row"
                    />
                  ),
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

                columnHelper.accessor((row) => row.fullName, {
                  id: "fullName",
                  header: "Nom et prénom",
                  cell: (props) => (
                    <>
                      <div className="uppercase">
                        {props.row.original.lastName}
                      </div>
                      <div className="capitalize">
                        {props.row.original.firstName}
                      </div>
                    </>
                  ),
                }),

                columnHelper.accessor((row) => row.phone, {
                  id: "phone",
                  header: "Téléphone",
                }),
              ]}
            />
          </div>

          <DialogFooter className="mt-6">
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <LazyButton variant={"secondary"}>
                  <div className="px-4 py-2">Fermer</div>
                </LazyButton>
              </DialogClose>

              <LazyButton
                type="submit"
                variant={"primary"}
                isLoading={form.formState.isSubmitting}
              >
                <div className="px-4 py-2">Valider</div>
              </LazyButton>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { AttachSubscriberDialog };

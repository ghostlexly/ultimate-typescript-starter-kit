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
import { LoadingDots } from "@/components/ui/loading-dots";
import { QueryErrorMessage } from "@/components/ui/query-error-message";
import { handleApiErrors } from "@/lib/handle-api-errors";
import { wolfios } from "@/lib/wolfios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type FormValues = {
  listingIds: string[];
};

const AttachListingDialog = ({ subscriberId, isOpen, setIsOpen }) => {
  const [filters, setFilters] = useState<any>();
  const [pagination, setPagination] = useState({
    pageIndex: 1, //initial page index
    pageSize: 50, //default page size
  });
  const queryClient = useQueryClient();
  const [selectedListings, setSelectedListings] = useState<Set<string>>(
    new Set()
  );

  const listings = useQuery({
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

  // -- fetch the subscriber to get the list of listings already attached
  const subscriber = useQuery({
    queryKey: ["customer", "subscribers", subscriberId],
    queryFn: () =>
      wolfios
        .get(`/api/customer/subscribers/${subscriberId}`)
        .then(async (res) => await res.json()),
    enabled: !!subscriberId,
  });

  // -- set the selected listings to the ones already attached to the subscriber
  useEffect(() => {
    if (subscriber.data && subscriber.data.listings) {
      setSelectedListings(
        new Set(subscriber.data.listings.map((item) => item.id))
      );
    }
  }, [subscriber.data]);

  const { mutateAsync } = useMutation({
    mutationFn: async (values: FormValues) => {
      return await wolfios.patch(
        `/api/customer/subscribers/${subscriberId}/attach-listings`,
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
        queryKey: ["customer", "subscribers", subscriberId],
      });
      toast.success("Les listes de diffusion ont été attachées au contact");
    },
  });

  const handleListingSelection = useCallback((listingId: string) => {
    setSelectedListings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  }, []);

  const form = useForm<FormValues>({
    values: {
      listingIds: Array.from(selectedListings),
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attacher une liste de diffusion</DialogTitle>
          <DialogDescription>
            Attachez une ou plusieurs listes de diffusion à ce contact.
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
              data={listings.data?.nodes || []}
              isLoading={
                listings.status === "pending" || subscriber.status === "pending"
              }
              setFilters={setFilters}
              pagination={pagination}
              setPagination={setPagination}
              pagesCount={listings.data?.pagination?.pagesCount || 1}
              columns={[
                columnHelper.accessor("id", {
                  id: "select",
                  header: "#",
                  enableColumnFilter: false,
                  enableSorting: false,
                  cell: ({ row }) => (
                    <Checkbox
                      checked={selectedListings.has(row.original.id)}
                      onCheckedChange={() =>
                        handleListingSelection(row.original.id)
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

                columnHelper.accessor((row) => row.name, {
                  id: "name",
                  header: "Nom de la liste",
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

export { AttachListingDialog };

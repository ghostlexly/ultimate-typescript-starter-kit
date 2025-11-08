"use client";

/**
 * @author GhostLexly <ghostlexly@gmail.com>
 *
 * DataTable Component - A powerful, reusable table component
 * Features: sorting, filtering, pagination, column visibility
 * Built with TanStack Table v8 & React Query
 *
 * Usage Example:
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   isLoading={isLoading}
 *   pageCount={pageCount}
 *   pagination={pagination}
 *   onPaginationChange={setPagination}
 *   sorting={sorting}
 *   onSortingChange={setSorting}
 * />
 * ```
 */

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  OnChangeFn,
} from "@tanstack/react-table";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconChevronUp,
  IconSelector,
  IconFilter,
  IconLayoutColumns,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Ban, X } from "lucide-react";
import { Badge } from "./badge";
import { Skeleton } from "./skeleton";
import { useState, useMemo, useRef, useEffect } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  onRowClick?: (row: TData) => void;
  className?: string;
  showColumnVisibility?: boolean;
  showPagination?: boolean;
  onFiltersClick?: () => void;
  filters?: Record<string, any>;
  onFiltersChange?: (filters: Record<string, any>) => void;
  filterLabels?: Record<string, string>;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Transforms TanStack Table sorting state to API format
 * @example transformSortingToApi([{ id: "createdAt", desc: true }]) → "createdAt:desc"
 */
export function transformSortingToApi(
  sorting: SortingState,
  format: "field:direction" | "field,direction" = "field:direction"
): string | undefined {
  if (sorting.length === 0) return undefined;

  const { id, desc } = sorting[0];
  const direction = desc ? "desc" : "asc";
  const separator = format === "field:direction" ? ":" : ",";

  return `${id}${separator}${direction}`;
}

/**
 * Removes empty values from filters object
 * @example transformFiltersToApi({ name: "John", age: "", status: null }) → { name: "John" }
 */
export function transformFiltersToApi(
  filters: Record<string, any>,
  emptyValues: any[] = ["", null, undefined]
): Record<string, any> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => !emptyValues.includes(value))
  );
}

/**
 * Builds complete API query parameters from table state
 * @example
 * buildApiQueryParams({
 *   pagination: { pageIndex: 0, pageSize: 10 },
 *   sorting: [{ id: "createdAt", desc: true }],
 *   filters: { status: "active", name: "" }
 * })
 * → { page: 1, first: 10, sort: "createdAt:desc", status: "active" }
 */
export function buildApiQueryParams(options: {
  pagination: { pageIndex: number; pageSize: number };
  sorting?: SortingState;
  filters?: Record<string, any>;
  sortFormat?: "field:direction" | "field,direction";
  pageKey?: string;
  pageSizeKey?: string;
  sortKey?: string;
}): Record<string, any> {
  const {
    pagination,
    sorting = [],
    filters = {},
    sortFormat = "field:direction",
    pageKey = "page",
    pageSizeKey = "first",
    sortKey = "sort",
  } = options;

  const sortParam = transformSortingToApi(sorting, sortFormat);
  const cleanFilters = transformFiltersToApi(filters);

  return {
    [pageKey]: pagination.pageIndex + 1,
    [pageSizeKey]: pagination.pageSize,
    ...(sortParam && { [sortKey]: sortParam }),
    ...cleanFilters,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pageCount = 0,
  pagination: controlledPagination,
  onPaginationChange,
  sorting: controlledSorting,
  onSortingChange,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
  onRowClick,
  className,
  showColumnVisibility = true,
  showPagination = true,
  onFiltersClick,
  filters,
  onFiltersChange,
  filterLabels = {},
}: DataTableProps<TData, TValue>) {
  // --------------------------------------------------------------------------
  // State Management - Internal state for uncontrolled usage
  // --------------------------------------------------------------------------
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize: 10,
    }
  );
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalColumnFilters, setInternalColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Update display data only when not loading
  // This prevents the layout from jumping because there is no data while the data is loading
  const [displayData, setDisplayData] = useState<TData[]>(data);
  useEffect(() => {
    if (!isLoading && data.length > 0) {
      setDisplayData(data);
    } else if (!isLoading && data.length === 0) {
      // If we have no data and we're not loading, it means we truly have no results
      setDisplayData([]);
    }
    // When isLoading is true, we keep the previous displayData
  }, [data, isLoading]);

  // Ref for scroll-to-top functionality
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const previousPageIndexRef = useRef<number | null>(null);

  // Use controlled state if provided, otherwise use internal state
  const pagination = controlledPagination ?? internalPagination;
  const setPagination = onPaginationChange ?? setInternalPagination;
  const sorting = controlledSorting ?? internalSorting;
  const setSorting = onSortingChange ?? setInternalSorting;
  const columnFilters = controlledColumnFilters ?? internalColumnFilters;
  const setColumnFilters = onColumnFiltersChange ?? setInternalColumnFilters;

  // --------------------------------------------------------------------------
  // Active Filters Logic
  // --------------------------------------------------------------------------
  const getActiveFilters = useMemo(() => {
    if (!filters) return [];

    return Object.entries(filters)
      .filter(([key, value]) => {
        // Filter out empty values
        if (value === "" || value === null || value === undefined) return false;
        return true;
      })
      .map(([key, value]) => ({
        key,
        value,
        label: filterLabels[key] || key,
      }));
  }, [filters, filterLabels]);

  const handleRemoveFilter = (filterKey: string) => {
    if (onFiltersChange && filters) {
      onFiltersChange({
        ...filters,
        [filterKey]: "",
      });
    }
  };

  const handleClearAllFilters = () => {
    if (onFiltersChange && filters) {
      const clearedFilters = Object.keys(filters).reduce(
        (acc, key) => {
          acc[key] = "";
          return acc;
        },
        {} as Record<string, any>
      );
      onFiltersChange(clearedFilters);
    }
  };

  // --------------------------------------------------------------------------
  // Scroll to top on page change (after data loads)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const currentPageIndex = pagination.pageIndex;

    // Skip on first render (when previousPageIndexRef is null)
    if (previousPageIndexRef.current === null) {
      previousPageIndexRef.current = currentPageIndex;
      return;
    }

    // Only scroll if page index actually changed
    if (previousPageIndexRef.current !== currentPageIndex) {
      const tableElement = tableContainerRef.current;
      if (tableElement) {
        const rect = tableElement.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.top <= window.innerHeight;

        // Only scroll if the table top is not visible
        if (!isVisible) {
          tableElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }

      // Update the ref with current page index
      previousPageIndexRef.current = currentPageIndex;
    }
  }, [pagination.pageIndex]);

  // --------------------------------------------------------------------------
  // Table Instance Configuration
  // --------------------------------------------------------------------------
  const table = useReactTable({
    data: displayData,
    columns,
    pageCount: pageCount,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    enableRowSelection: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div
      ref={tableContainerRef}
      className={cn("flex flex-col gap-4", className)}
    >
      {/* Toolbar - Filters & Column Visibility */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onFiltersClick && (
            <Button variant="outline" size="sm" onClick={onFiltersClick}>
              <IconFilter className="size-4" />
              <span className="hidden lg:inline">Filtres</span>
            </Button>
          )}
        </div>

        {showColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns className="size-4" />
                <span className="hidden lg:inline">Colonnes</span>
                <IconChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Active Filters Display */}
      {getActiveFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Filtres actifs:
          </span>
          {getActiveFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="gap-1 pr-1">
              <span className="font-medium">{filter.label}:</span>
              <span>{filter.value}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full p-0 hover:bg-muted"
                onClick={() => handleRemoveFilter(filter.key)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">
                  Supprimer le filtre {filter.label}
                </span>
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleClearAllFilters}
          >
            Tout effacer
          </Button>
        </div>
      )}

      {/* Table Container */}
      <div className="relative overflow-hidden rounded-lg border">
        <Table>
          {/* Table Header - Sortable columns */}
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : canSort ? (
                        <div
                          className={cn(
                            "flex cursor-pointer select-none items-center gap-2",
                            header.column.getCanSort() &&
                              "hover:text-foreground"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {isSorted === "desc" ? (
                            <IconChevronDown className="size-4" />
                          ) : isSorted === "asc" ? (
                            <IconChevronUp className="size-4" />
                          ) : (
                            <IconSelector className="size-4 opacity-50" />
                          )}
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          {/* Table Body - Data rows with loading & empty states */}
          <TableBody>
            {isLoading && displayData.length === 0 ? (
              // Show skeleton rows when loading and no previous data
              Array.from({ length: pagination.pageSize }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={`skeleton-${index}-${colIndex}`}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => {
                    // Don't trigger row click if clicking on interactive elements
                    const target = e.target as HTMLElement;
                    const isInteractiveElement = target.closest(
                      'a, button, [role="button"], [role="menuitem"], [role="menu"]'
                    );

                    if (onRowClick && !isInteractiveElement) {
                      e.stopPropagation();
                      onRowClick(row.original);
                    }
                  }}
                  className={cn(
                    "transition-colors hover:bg-muted/50",
                    onRowClick && "cursor-pointer",
                    isLoading && "opacity-50"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Ban size={36} className="text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {showPagination && (
        <div className="flex items-center justify-between px-4">
          {/* Page info - Desktop only */}
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            Affichage de la page {table.getState().pagination.pageIndex + 1} de{" "}
            {pageCount || 1}
          </div>

          {/* Pagination controls */}
          <div className="flex w-full items-center gap-8 lg:w-fit">
            {/* Rows per page selector - Desktop only */}
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Lignes par page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page info - Mobile */}
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {pageCount || 1}
            </div>

            {/* Navigation buttons */}
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Aller à la première page</span>
                <IconChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Aller à la page précédente</span>
                <IconChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Aller à la page suivante</span>
                <IconChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(pageCount - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Aller à la dernière page</span>
                <IconChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

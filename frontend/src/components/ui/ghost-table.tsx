"use client";

/**
 * @author GhostLexly <ghostlexly@gmail.com>
 * UI inspired from: https://ui.shadcn.com/examples/tasks
 */

import { cn } from "@/lib/utils";
import { useDebouncedValue, useIntersection } from "@mantine/hooks";
import {
  Column,
  Table,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Ban,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { LoadingDots } from "@/components/ui/loading-dots";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GhostCombobox } from "@/components/ui/inputs/ghost-combobox";
import Pagination from "@/components/ui/pagination";

type GhostTableProps = {
  data: Array<any>;
  isLoading: boolean;
  columns: any[];
  className?: string;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: React.Dispatch<any>;
  pagesCount: number;
  setFilters: React.Dispatch<any>;
};

const GhostTable: React.FC<GhostTableProps> = ({
  data,
  isLoading,
  columns,
  className,
  pagination,
  setPagination,
  pagesCount,
  setFilters,
}) => {
  // -- declare table
  const table = useReactTable({
    columns: columns,
    data: data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    manualPagination: true,
    renderFallbackValue: "-",
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });
  const state = table.getState();

  // -- handle sorting
  useEffect(() => {
    if (state.sorting.length === 0) {
      setFilters((prev) => ({ ...prev, sort: undefined }));
      return;
    }

    const sort = state.sorting[0];
    const sortString = `${sort.id}:${sort.desc ? `desc` : `asc`}`;
    setFilters((prev) => ({ ...prev, sort: sortString }));
  }, [state.sorting, setFilters]);

  // -- handle searching
  useEffect(() => {
    const filters = state.columnFilters;

    // -- création d'un objet qui accumule tous les filtres
    const filtersObject = filters.reduce((acc, filter) => {
      const { id, value } = filter;

      // ajout de chaque paire id-value dans l'accumulateur
      acc[id] = value;

      return acc;
    }, {});

    setFilters((prev) => ({ sort: prev?.sort, ...filtersObject }));

    // -- reset pagination to 1 when filters change
    table.setPageIndex(1);
  }, [state.columnFilters, setFilters, table]);

  return (
    <>
      <div
        className={cn(
          "max-w-full overflow-x-scroll rounded-md border",
          className
        )}
      >
        <table className="w-full table-auto text-sm">
          <TableHeader table={table} />

          <TableBody table={table} isLoading={isLoading} />
        </table>

        <TablePagination table={table} pagesCount={pagesCount} />
      </div>
    </>
  );
};

const TableHeader: React.FC<{
  table: Table<any>;
}> = ({ table }) => {
  return (
    <thead className="[&_tr]:border-b">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr
          key={headerGroup.id}
          className="transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-50"
        >
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              colSpan={header.colSpan}
              className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
            >
              {header.isPlaceholder ? null : (
                <>
                  <div
                    className={
                      "flex cursor-pointer items-center gap-1 rounded-md hover:text-muted-foreground"
                    }
                  >
                    {/* -- Render header column data */}
                    <div
                      onClick={header.column.getToggleSortingHandler()}
                      className="text-nowrap"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>

                    {/* -- Render sorting icon */}
                    {header.column.getCanSort() && (
                      <div onClick={header.column.getToggleSortingHandler()}>
                        {header.column.getIsSorted() === "desc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : header.column.getIsSorted() === "asc" ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3" />
                        )}
                      </div>
                    )}

                    {/* -- Render filter icon */}
                    <SearchPopover header={header} table={table} />
                  </div>
                </>
              )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
};

type SearchPopoverProps = {
  header: any;
  table: Table<any>;
};

const SearchPopover: React.FC<SearchPopoverProps> = ({ header, table }) => {
  const [isOpen, setIsOpen] = useState(false);

  // get column from header
  const column = header.column;

  // get column type from metas
  const columnType = getColumnType({ column });

  const closePopover = () => {
    setIsOpen(false);
  };

  const handleOnKeyDown = (event) => {
    if (event.key === "Enter") {
      closePopover();
    }
  };

  return (
    <>
      {column.getCanFilter() && (
        <div onKeyDown={handleOnKeyDown}>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger>
              <Search
                className={cn(
                  "h-3 w-3",
                  column.getFilterValue() && "text-gray-900"
                )}
              />
            </PopoverTrigger>

            <PopoverContent className={cn("w-48")}>
              <PopoverFilterContent
                column={column}
                table={table}
                closePopover={closePopover}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </>
  );
};

const TableBody: React.FC<{ table: Table<any>; isLoading: boolean }> = ({
  table,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <tbody>
        <tr className="relative h-20">
          <td className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <LoadingDots />
          </td>
        </tr>
      </tbody>
    );
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <tbody>
        <tr className="relative h-20">
          <td className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <Ban size={36} className="text-gray-300" />
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {table.getRowModel().rows.map((row) => (
        <tr
          key={row.id}
          className="border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-50"
        >
          {row.getVisibleCells().map((cell) => (
            <td
              key={cell.id}
              className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

const TablePagination = ({
  table,
  pagesCount,
}: {
  table: Table<any>;
  pagesCount: number;
}) => {
  const onPageChange = (page) => {
    table.setPageIndex(page);
  };

  return (
    <>
      <Pagination
        page={table.getState().pagination.pageIndex}
        pagesCount={pagesCount}
        onChange={onPageChange}
      />
    </>
  );
};

const PopoverFilterContent: React.FC<{
  column: Column<any, unknown>;
  table: Table<any>;
  closePopover: () => void;
}> = ({ column, table, closePopover }) => {
  // get column type from metas
  const columnType = getColumnType({ column });

  if (columnType === "range") {
    return <RangeFilter column={column} />;
  } else if (columnType === "combobox") {
    return <ComboboxFilter column={column} closePopover={closePopover} />;
  } else if (columnType === "text") {
    return <SimpleTextFilter column={column} />;
  }
};

const SimpleTextFilter: React.FC<{ column: Column<any, unknown> }> = ({
  column,
}) => {
  // get column filter's search value
  const filterValue: string = String(column.getFilterValue() ?? "");

  return (
    <>
      <DebouncedInput
        type="text"
        value={filterValue}
        onChange={(value) => {
          if (value) {
            column.setFilterValue(value); // set table filters on columns
          } else if (filterValue) {
            column.setFilterValue(undefined); // clear table filters on columns
          }
        }}
        placeholder={`Rechercher..`}
        list={`${column.id}-list`}
      />
    </>
  );
};

const RangeFilter: React.FC<{ column: Column<any, unknown> }> = ({
  column,
}) => {
  // get column filter's search value
  const filterValue = column.getFilterValue();

  return (
    <div className="flex space-x-2">
      <DebouncedInput
        type="number"
        min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
        max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
        value={(filterValue as [number, number])?.[0] ?? ""}
        onChange={(value) =>
          column.setFilterValue((old: [number, number]) => [value, old?.[1]])
        }
        placeholder={`Min ${
          column.getFacetedMinMaxValues()?.[0]
            ? `(${column.getFacetedMinMaxValues()?.[0]})`
            : ""
        }`}
      />
      <DebouncedInput
        type="number"
        min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
        max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
        value={(filterValue as [number, number])?.[1] ?? ""}
        onChange={(value) =>
          column.setFilterValue((old: [number, number]) => [old?.[0], value])
        }
        placeholder={`Max ${
          column.getFacetedMinMaxValues()?.[1]
            ? `(${column.getFacetedMinMaxValues()?.[1]})`
            : ""
        }`}
      />
    </div>
  );
};

const ComboboxFilter: React.FC<{
  column: Column<any, unknown>;
  closePopover: () => void;
}> = ({ column, closePopover }) => {
  // get column filter's search value
  const filterValue: string = String(column.getFilterValue() ?? "");
  const options = column.columnDef.meta
    ? column.columnDef?.meta["options"]
    : null;

  return (
    <>
      <GhostCombobox
        label="Rechercher..."
        options={options}
        isClearable
        value={filterValue}
        onChange={(option) => {
          if (option.value !== filterValue) {
            column.setFilterValue(option.value); // set table filters on columns
            closePopover();
          } else if (option.value === null && filterValue) {
            column.setFilterValue(undefined); // clear table filters on columns
            closePopover();
          }
        }}
      />
    </>
  );
};

const DebouncedInput = forwardRef<
  HTMLInputElement,
  {
    value: string | number;
    onChange: (value: string | number) => void;
  } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">
>(function DebouncedInput({ value: initialValue, onChange, ...props }, ref) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [debouncedSearchValue] = useDebouncedValue(searchValue, 300, {
    leading: true,
  });
  const [stopDebounce, setStopDebounce] = useState(false);

  const handleOnKeyDown = (event) => {
    if (event.key === "Enter") {
      setStopDebounce(true);
      onChange(searchValue);
    }
  };

  useEffect(() => {
    if (debouncedSearchValue !== initialValue && !stopDebounce) {
      onChange(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onChange, initialValue, stopDebounce]);

  return (
    <input
      {...props}
      ref={ref}
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onKeyDown={handleOnKeyDown}
      className="w-full rounded border px-2 py-1 text-sm shadow outline-none focus:border-gray-400"
    />
  );
});

const getColumnType = ({ column }) => {
  return column.columnDef.meta?.type ?? "text";
};

const columnHelper = createColumnHelper<any>();

export { GhostTable, columnHelper };

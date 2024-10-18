import React from "react";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";

type PaginationProps = {
  pagesCount: number;
  page: number;
  onChange: (page: number) => void;
  showFirstButton?: boolean;
  showLastButton?: boolean;
};

const Pagination: React.FC<PaginationProps> = ({
  pagesCount,
  page,
  onChange,
  showFirstButton = true,
  showLastButton = true,
}) => {
  if (pagesCount === 0) pagesCount = 1;

  const pagination = usePagination({
    total: pagesCount,
    page,
    onChange,
    initialPage: 1,
  });

  const isFirstPage = pagination.active === 1;
  const isLastPage =
    pagination.active === pagination.range[pagination.range.length - 1];

  const handleFirstPage = () => {
    pagination.first();
  };

  const handlePreviousPage = () => {
    pagination.previous();
  };

  const handleNextPage = () => {
    pagination.next();
  };

  const handleLastPage = () => {
    pagination.last();
  };

  const handleGoToPage = (page: number) => {
    pagination.setPage(page);
  };

  return (
    <>
      <div className="flex items-center justify-start gap-1 text-sm">
        {showFirstButton && (
          <div
            className={cn(
              "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-gray-50",
              (pagination.range.length === 1 || isFirstPage) && "text-gray-300"
            )}
            onClick={handleFirstPage}
          >
            <ChevronsLeft className="h-4 w-4" />
          </div>
        )}

        <div
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-gray-50",
            (pagination.range.length === 1 || isFirstPage) && "text-gray-300"
          )}
          onClick={handlePreviousPage}
        >
          <ChevronLeft className="h-4 w-4" />
        </div>

        {pagination.range.map((page, index) => {
          if (page === "dots") {
            return (
              <div
                className="flex h-8 w-8 items-center justify-center"
                key={index}
              >
                ...
              </div>
            );
          }

          return (
            <div
              className={cn(
                "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-gray-50",
                pagination.active === page && "bg-gray-100 hover:bg-gray-200"
              )}
              key={index}
              onClick={() => handleGoToPage(page)}
            >
              {page}
            </div>
          );
        })}

        <div
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-gray-50",
            (pagination.range.length === 1 || isLastPage) && "text-gray-300"
          )}
          onClick={handleNextPage}
        >
          <ChevronRight className="h-4 w-4" />
        </div>

        {showLastButton && (
          <div
            className={cn(
              "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-gray-50",
              (pagination.range.length === 1 || isLastPage) && "text-gray-300"
            )}
            onClick={handleLastPage}
          >
            <ChevronsRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </>
  );
};

export default Pagination;

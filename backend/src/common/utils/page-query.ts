import { z } from 'zod';

export const pageQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  first: z.coerce.number().min(1).optional(),
  sort: z.string().optional(),
  include: z.union([z.string(), z.array(z.string())]).optional(),
});

export type PageQueryInput = z.infer<typeof pageQuerySchema> & {
  [key: string]: unknown;
};

export type SortDirection = 'asc' | 'desc';

type OrderByObject = { [key: string]: SortDirection | OrderByObject };
export type OrderBy = OrderByObject | OrderByObject[];

const buildNestedOrderBy = (
  path: string,
  direction: SortDirection,
): OrderByObject | undefined => {
  const parts = path
    .split('.')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return undefined;

  // Build nested object: a.b.c -> { a: { b: { c: direction } } }
  return parts.reduceRight<OrderByObject | SortDirection>((acc, key, idx) => {
    if (idx === parts.length - 1) {
      return { [key]: direction } as OrderByObject;
    }
    return { [key]: acc } as OrderByObject;
  }, direction) as OrderByObject;
};

const parseSorting = ({
  sort,
  allowedFields,
  defaultSort,
}: {
  sort?: string;
  allowedFields?: string[];
  defaultSort?: OrderBy;
}): OrderBy | undefined => {
  if (!sort) return defaultSort;

  const entries = sort
    .split(',')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [columnRaw, directionRaw] = pair.split(':');
      const column = (columnRaw || '').trim();
      const dir = (directionRaw || 'desc').toLowerCase() as SortDirection;
      const direction: SortDirection = dir === 'asc' ? 'asc' : 'desc';
      return { column, direction } as {
        column: string;
        direction: SortDirection;
      };
    })
    .filter(({ column }) =>
      allowedFields ? allowedFields.includes(column) : Boolean(column),
    );

  if (entries.length === 0) return defaultSort;

  const orderObjects = entries
    .map(({ column, direction }) => buildNestedOrderBy(column, direction))
    .filter(Boolean) as OrderByObject[];

  if (orderObjects.length === 0) return defaultSort;
  if (orderObjects.length === 1) return orderObjects[0];
  return orderObjects;
};

const parseIncludes = (include?: string | string[]) => {
  const includes = new Set<string>();
  if (!include) return includes;
  if (Array.isArray(include)) {
    include.forEach((i) => includes.add(i));
  } else if (typeof include === 'string') {
    include
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean)
      .forEach((i) => includes.add(i));
  }
  return includes;
};

export const getPagination = ({
  page,
  first,
}: {
  page?: number;
  first?: number;
}) => {
  const currentPage = page ?? 1;
  let itemsPerPage = first ?? 50;

  if (itemsPerPage > 100) {
    itemsPerPage = 100;
  }

  const take = itemsPerPage;
  const skip = (currentPage - 1) * itemsPerPage;
  return { take, skip, currentPage, itemsPerPage };
};

export const buildQueryParams = ({
  query,
  allowedSortFields,
  defaultSort,
}: {
  query: PageQueryInput;
  allowedSortFields?: string[];
  defaultSort?: OrderBy;
}) => {
  const { page, first, sort, include } = query as {
    page?: number;
    first?: number;
    sort?: string;
    include?: string | string[];
  };

  const pagination = getPagination({ page, first });
  const orderBy = parseSorting({
    sort,
    allowedFields: allowedSortFields,
    defaultSort,
  });
  const includes = parseIncludes(include);

  return {
    pagination,
    orderBy,
    includes,
  };
};

export const transformWithPagination = ({
  data,
  count,
  page,
  first,
}: {
  data: unknown;
  count: number;
  page: number;
  first: number;
}) => {
  const pagesCount = Math.ceil(count / first);
  return {
    nodes: data,
    pagination: {
      currentPage: page,
      itemsPerPage: first,
      pagesCount,
      itemsCount: count,
    },
  };
};

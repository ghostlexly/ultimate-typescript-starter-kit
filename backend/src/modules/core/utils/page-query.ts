import { z } from 'zod';

/**
 * Zod schema for validating common pagination/query parameters
 * Used to validate query strings from HTTP requests
 */
export const pageQuerySchema = z
  .object({
    page: z.coerce.number().min(1).optional(), // Page number (1-indexed)
    first: z.coerce.number().min(1).optional(), // Items per page
    sort: z.string().optional(), // Sort string (e.g., 'name:asc,email:desc')
    include: z.union([z.string(), z.array(z.string())]).optional(), // Relations to include
  })
  .partial();

/**
 * TypeScript type inferred from the pageQuerySchema
 * Allows additional unknown properties for flexibility
 */
export type PageQueryInput = z.infer<typeof pageQuerySchema> & {
  [key: string]: unknown;
};

/**
 * Valid sort directions for database queries
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Represents a Prisma orderBy object (can be nested)
 * Examples:
 * - Simple: { name: 'asc' }
 * - Nested: { customer: { name: 'desc' } }
 * - Deep nested: { user: { profile: { email: 'asc' } } }
 */
type OrderByObject = { [key: string]: SortDirection | OrderByObject };

/**
 * OrderBy can be a single object or an array of objects for multiple sort criteria
 * Examples:
 * - Single: { name: 'asc' }
 * - Multiple: [{ name: 'asc' }, { createdAt: 'desc' }]
 * - Mixed: [{ customer: { name: 'desc' } }, { id: 'asc' }]
 */
export type OrderBy = OrderByObject | OrderByObject[];

/**
 * Builds a nested orderBy object from a dot-notation path
 *
 * @example
 * buildNestedOrderBy('customer.name', 'asc')
 * // Returns: { customer: { name: 'asc' } }
 *
 * @example
 * buildNestedOrderBy('user.profile.email', 'desc')
 * // Returns: { user: { profile: { email: 'desc' } } }
 *
 * @param path - Dot-separated path (e.g., 'customer.name' or 'user.profile.email')
 * @param direction - Sort direction ('asc' or 'desc')
 * @returns Nested object structure for Prisma orderBy, or undefined if path is invalid
 */
const buildNestedOrderBy = (
  path: string,
  direction: SortDirection,
): OrderByObject | undefined => {
  // Split the path by dots and clean up whitespace
  const parts = path
    .split('.')
    .map((p) => p.trim())
    .filter(Boolean);

  // Return undefined if no valid parts found
  if (parts.length === 0) return undefined;

  // Build nested object from right to left: a.b.c -> { a: { b: { c: direction } } }
  // reduceRight processes the array from the last element to the first
  return parts.reduceRight<OrderByObject | SortDirection>((acc, key, idx) => {
    // For the last element (rightmost), create the innermost object with the direction
    if (idx === parts.length - 1) {
      return { [key]: direction } as OrderByObject;
    }
    // For all other elements, wrap the accumulator in a new object
    return { [key]: acc } as OrderByObject;
  }, direction) as OrderByObject;
};

/**
 * Parses a sort query string into a Prisma orderBy object
 *
 * @example
 * parseSorting({ sort: 'name:asc', allowedFields: ['name', 'email'] })
 * // Returns: { name: 'asc' }
 *
 * @example
 * parseSorting({ sort: 'customer.name:desc,createdAt:asc', allowedFields: ['customer.name', 'createdAt'] })
 * // Returns: [{ customer: { name: 'desc' } }, { createdAt: 'asc' }]
 *
 * @example
 * parseSorting({ sort: 'invalid', allowedFields: ['name'], defaultSort: { id: 'desc' } })
 * // Returns: { id: 'desc' } (falls back to defaultSort)
 *
 * @param sort - Comma-separated sort string (e.g., 'name:asc,email:desc')
 * @param allowedFields - Array of allowed field paths (including nested like 'customer.name')
 * @param defaultSort - Default orderBy to use if no valid sort is provided (supports nested objects)
 * @returns Prisma orderBy object (single object or array), or undefined if no sort specified
 */
const parseSorting = ({
  sort,
  allowedFields,
  defaultSort,
}: {
  sort?: string;
  allowedFields?: string[];
  defaultSort?: OrderBy;
}): OrderBy | undefined => {
  // If no sort parameter provided, return the default sort
  if (!sort) return defaultSort;

  // Parse the sort string into individual sort entries
  const entries = sort
    // Split by comma to get individual sort pairs
    .split(',')
    .map((pair) => pair.trim())
    .filter(Boolean)
    // Parse each pair (e.g., 'name:asc' -> { column: 'name', direction: 'asc' })
    .map((pair) => {
      const [columnRaw, directionRaw] = pair.split(':');
      const column = (columnRaw || '').trim();
      // Default to 'desc' if no direction specified
      const dir = (directionRaw || 'desc').toLowerCase() as SortDirection;
      // Ensure direction is either 'asc' or 'desc'
      const direction: SortDirection = dir === 'asc' ? 'asc' : 'desc';
      return { column, direction } as {
        column: string;
        direction: SortDirection;
      };
    })
    // Filter to only allowed fields (supports nested paths like 'customer.name')
    .filter(({ column }) =>
      allowedFields ? allowedFields.includes(column) : Boolean(column),
    );

  // If no valid entries after filtering, return default sort
  if (entries.length === 0) return defaultSort;

  // Convert each entry to a nested orderBy object
  const orderObjects = entries
    .map(({ column, direction }) => buildNestedOrderBy(column, direction))
    .filter(Boolean) as OrderByObject[];

  // If no valid order objects created, return default sort
  if (orderObjects.length === 0) return defaultSort;

  // Return single object if only one sort, otherwise return array for multiple sorts
  if (orderObjects.length === 1) return orderObjects[0];
  return orderObjects;
};

/**
 * Parses include query parameter(s) into a Set of relation names
 *
 * @example
 * parseIncludes('customer,booking')
 * // Returns: Set { 'customer', 'booking' }
 *
 * @example
 * parseIncludes(['customer', 'booking'])
 * // Returns: Set { 'customer', 'booking' }
 *
 * @param include - Single string (comma-separated) or array of relation names to include
 * @returns Set of unique relation names to include in the query
 */
const parseIncludes = (include?: string | string[]) => {
  const includes = new Set<string>();

  // Return empty set if no includes provided
  if (!include) return includes;

  // Handle array input
  if (Array.isArray(include)) {
    include.forEach((i) => includes.add(i));
  } else {
    // Handle string input (comma-separated)
    include
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean)
      .forEach((i) => includes.add(i));
  }

  return includes;
};

/**
 * Calculates pagination parameters for database queries
 *
 * @example
 * getPagination({ page: 2, first: 20 })
 * // Returns: { take: 20, skip: 20, currentPage: 2, itemsPerPage: 20 }
 *
 * @example
 * getPagination({ page: 1, first: 150 })
 * // Returns: { take: 100, skip: 0, currentPage: 1, itemsPerPage: 100 } (capped at 100)
 *
 * @param page - Page number (1-indexed), defaults to 1
 * @param first - Number of items per page, defaults to 50, max 100
 * @returns Object with Prisma pagination params (take, skip) and metadata
 */
export const getPagination = ({
  page,
  first,
}: {
  page?: number;
  first?: number;
}) => {
  // Default to page 1 if not specified
  const currentPage = page ?? 1;

  // Default to 50 items per page if not specified
  let itemsPerPage = first ?? 50;

  // Cap at maximum 100 items per page for performance
  if (itemsPerPage > 100) {
    itemsPerPage = 100;
  }

  // Calculate Prisma query parameters
  const take = itemsPerPage; // Number of records to fetch
  const skip = (currentPage - 1) * itemsPerPage; // Number of records to skip

  return { take, skip, currentPage, itemsPerPage };
};

/**
 * Main utility to build complete query parameters from URL query string
 * Combines pagination, sorting, and includes into a single object ready for Prisma
 *
 * @example
 * buildQueryParams({
 *   query: { page: 2, first: 25, sort: 'name:asc', include: 'customer' },
 *   allowedSortFields: ['name', 'email'],
 *   defaultSort: { createdAt: 'desc' }
 * })
 * // Returns: {
 * //   pagination: { take: 25, skip: 25, currentPage: 2, itemsPerPage: 25 },
 * //   orderBy: { name: 'asc' },
 * //   includes: Set { 'customer' }
 * // }
 *
 * @example
 * // With nested sorting
 * buildQueryParams({
 *   query: { sort: 'customer.name:desc' },
 *   allowedSortFields: ['customer.name']
 * })
 * // Returns: { orderBy: { customer: { name: 'desc' } }, ... }
 *
 * @param query - The parsed query parameters from the request
 * @param allowedSortFields - Whitelist of sortable fields (including nested paths like 'customer.name')
 * @param defaultSort - Default sort when no sort specified (supports nested orderBy objects)
 * @returns Object containing pagination params, orderBy clause, and includes set
 */
export const buildQueryParams = ({
  query,
  allowedSortFields,
  defaultSort,
}: {
  query: PageQueryInput;
  allowedSortFields?: string[];
  defaultSort?: OrderBy;
}) => {
  // Extract relevant query parameters
  const { page, first, sort, include } = query as {
    page?: number;
    first?: number;
    sort?: string;
    include?: string | string[];
  };

  // Build pagination parameters
  const pagination = getPagination({ page, first });

  // Parse and validate sorting
  const orderBy = parseSorting({
    sort,
    allowedFields: allowedSortFields,
    defaultSort,
  });

  // Parse includes into a Set
  const includes = parseIncludes(include);

  return {
    pagination,
    orderBy,
    includes,
  };
};

/**
 * Wraps query results with pagination metadata
 * Transforms raw database results into a paginated response format
 *
 * @example
 * transformWithPagination({
 *   data: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }],
 *   count: 42,
 *   page: 2,
 *   first: 20
 * })
 * // Returns: {
 * //   nodes: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }],
 * //   pagination: {
 * //     currentPage: 2,
 * //     itemsPerPage: 20,
 * //     pagesCount: 3,
 * //     itemsCount: 42
 * //   }
 * // }
 *
 * @param data - The array of records returned from the database query
 * @param count - Total number of records in the database (from count query)
 * @param page - Current page number
 * @param first - Items per page
 * @returns Paginated response with nodes and pagination metadata
 */
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
  // Calculate total number of pages (rounded up)
  const pagesCount = Math.ceil(count / first);

  return {
    nodes: data, // The actual data records
    pagination: {
      currentPage: page,
      itemsPerPage: first,
      pagesCount, // Total number of pages available
      itemsCount: count, // Total number of records in database
    },
  };
};

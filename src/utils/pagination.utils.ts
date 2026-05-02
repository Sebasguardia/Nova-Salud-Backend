export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const getPaginationMeta = (
  total: number,
  params: PaginationParams,
): PaginationMeta => ({
  page:       params.page,
  limit:      params.limit,
  total,
  totalPages: Math.ceil(total / params.limit),
});

export const getSkip = (page: number, limit: number): number =>
  (page - 1) * limit;
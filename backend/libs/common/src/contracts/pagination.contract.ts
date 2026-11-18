export interface PageQuery {
  page?: number;
  limit?: number;
}

interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export function resolvePage(query: PageQuery): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.limit) || DEFAULT_PAGE_SIZE));
  return { page, limit, skip: (page - 1) * limit };
}

export function toPaginated<T>(data: T[], total: number, page: number, limit: number): Paginated<T> {
  return {
    data,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

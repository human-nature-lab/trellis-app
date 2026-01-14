export default interface Pagination <T> {
  total: number
  start: number
  count: number
  sortBy?: string
  data?: T[]
}

export interface RandomPagination {
  page: number
  size: number
  total: number
  seed?: number|string
}

export interface RandomPaginationResult <T> extends RandomPagination {
  data: T[]
}

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
  seed: number|string
}

export interface RandomPaginationResult <T> extends RandomPagination {
  data: T[]
}

export interface LaravelPaginated <T> {
  current_page: number
  data: T[]
  first_page_url?: string
  from: number
  next_page_url?: string
  path?: string
  per_page: number
  prev_page_url?: string
  to: number
}
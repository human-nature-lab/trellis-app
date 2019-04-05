export default interface Pagination <T> {
  total: number
  start: number
  count: number
  sortBy?: string
  data?: T[]
}

export type SortDirection = 'asc' | 'desc'

export type Header = {
  label: string
  key: string
  sortable?: boolean
  filterable?: boolean
  width?: number
}

export type Table<T extends Record<string, any>> = {
  title?: string
  filters?: string[]
  header: Header[]
  rows: T[]
  summary?: { label: string; value: any }[]
}

export type SetOpts = {
  lifetime: number | (() => number)
}

export interface Store {
  set<T> (key: string, value: T, opts?: Partial<SetOpts>)
  get<T> (key: string): T | null
  all(): Iterable<[string, any]>
  remove (key: string)
  clear ()
}

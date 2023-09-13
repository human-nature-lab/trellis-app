import { indexOfAll } from "@/classes/strings"

export function namedQuery (q: string, p: Record<string, any>) {
  let query = q
  const paramGroups = []

  for (const [key, value] of Object.entries(p)) {
    if (value === null) {
      query = query.replace(`:${key}`, 'null')
    } else if (Array.isArray(value)) {
      const indices = indexOfAll(query, `:${key}`)
      for (const index of indices) {
        query = query.replace(`:${key}`, value.map(_ => '?').join(','))
        paramGroups.push({ index, value })
      }
    } else {
      const indices = indexOfAll(query, `:${key}`)
      for (const index of indices) {
        query = query.replace(`:${key}`, '?')
        paramGroups.push({ index, value })
      }
    }
  }

  const params = paramGroups.sort((a, b) => a.index - b.index).reduce((agg: any[], g) => {
    if (Array.isArray(g.value)) {
      return agg.concat(g.value)
    }
    agg.push(g.value)
    return agg
  }, [])
  return { query, params }
}

export type QueuableRoute = {
  name?: string
  path?: string
  query?: {
    [key: string]: any
    q?: string[]
  }
  params?: {[key: string]: any}
}

export function sanitizeRoute (route: QueuableRoute): QueuableRoute {
  return {
    name: route.name,
    path: route.path,
    query: route.query,
    params: route.params,
  }
}

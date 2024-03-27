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

export function routesAreSame (routeA: QueuableRoute, routeB: QueuableRoute): boolean {
  if (routeA === routeB) return true
  if (!routeA || !routeB) return false
  if (routeA.name !== routeB.name) return false
  if (routeA.path !== routeB.path) return false
  return true
}

export function geoSearchRoute (geoId: string) {
  return {
    name: 'GeoSearch',
    query: {
      filters: JSON.stringify({
        parent: geoId,
      }),
    },
  }
}

export function geoMapSearchRoute (geoId: string) {
  return {
    name: 'GeoSearchWithMap',
    params: {
      geoId,
    },
  }
}

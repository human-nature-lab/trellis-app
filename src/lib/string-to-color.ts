const colorCache = new Map<string, string>()

export function stringToColor (v: string): string {
  if (colorCache.has(v)) {
    return colorCache.get(v) as string
  }
  let hash = 0
  for (let i = 0; i < v.length; i++) {
    hash = v.charCodeAt(i) + ((hash << 5) - hash)
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
  const color = '#' + '00000'.substring(0, 6 - c.length) + c
  colorCache.set(v, color)
  return color
}

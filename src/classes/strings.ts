export function replaceAll (s: string, needle: string, replacement: string) {
  let n = s
  do {
    s = n
    n = s.replace(needle, replacement)
  } while (n !== s)
  return n
}

export function indexOfAll (s: string, needle: string): number[] {
  const res = []
  let i = s.indexOf(needle)
  while (i !== -1) {
    res.push(i)
    i = s.indexOf(needle, i + 1)
  }
  return res
}

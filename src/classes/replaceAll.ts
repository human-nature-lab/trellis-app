export function replaceAll (s: string, needle: string, replacement: string) {
  let n = s
  do {
    s = n
    n = s.replace(needle, replacement)
  } while (n !== s)
  return n
}
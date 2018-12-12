export default function requireAll (r) {
  const o = {}
  for (let fileName of r.keys()) {
    o[fileName] = r(fileName)
  }
  return o
}

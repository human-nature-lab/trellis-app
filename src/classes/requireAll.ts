export default function requireAll (r) {
  const o = {}
  for (let fileName of r.keys()) {
    o[fileName] = r(fileName)
  }
  return o
}

export function requireAllModules (r, ) {
  const modules = requireAll(r)
  return Object.keys(modules).map(k => modules[k].default)
}
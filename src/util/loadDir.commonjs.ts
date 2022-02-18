function importMetaGlob (dir: string) {
  require.context()
  require.context(dir, recursive, filter)
  const o = {}
  for (let fileName of r.keys()) {
    o[fileName] = r(fileName)
  }
  return o
}

function requireAllModules (r, ) {
  const modules = requireAll(r)
  return Object.keys(modules).map(k => modules[k].default)
}

export function loadDir<R> (dir: string, ext?: string, recursive = true): Record<string, R> {
  let filter
  if (ext) {
    filter = new RegExp(`/\.${ext}$/`)
  }
  return requireAll()
}
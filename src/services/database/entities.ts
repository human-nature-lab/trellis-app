export const trellisConfigEntities = []
export const trellisEntities = []

const trellisConfigImports = import.meta.globEager('../../entities/trellis-config/*.ts')
for (const name in trellisConfigImports) {
  trellisConfigEntities.push(trellisConfigImports[name].default)
}

const trellisImports = import.meta.globEager('../../entities/trellis/*.ts')
for (const name in trellisImports) {
  trellisEntities.push(trellisImports[name].default)
}

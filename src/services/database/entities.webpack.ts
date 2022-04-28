import requireAll from '../../classes/requireAll'

export const trellisConfigEntities = []
export const trellisEntities = []

const trellisConfigImports = requireAll(require.context('../../entities/trellis-config', true, /\.ts$/))

for (const name in trellisConfigImports) {
  trellisConfigEntities.push(trellisConfigImports[name].default)
}

const trellisImports = requireAll(require.context('../../entities/trellis', true, /\.ts$/))
for (const name in trellisImports) {
  trellisEntities.push(trellisImports[name].default)
}

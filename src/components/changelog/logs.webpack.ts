import requireAll from '../../classes/requireAll'

export const changelog = requireAll(require.context('../../../changelog', true, /\.md$/))

for (const key in changelog) {
  const newKey = key.replace('./', '')
  changelog[newKey] = changelog[key].default
  delete changelog[key]
}

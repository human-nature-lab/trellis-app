import requireAll from '../../classes/requireAll'

export const changelog = requireAll(require.context('../../../changelog', false, /\.md$/))

for (const key in changelog) {
  const newKey = key.replace('../../../changelog/', '')
  changelog[newKey] = changelog[key]
  delete changelog[key]
}

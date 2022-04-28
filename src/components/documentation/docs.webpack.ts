import requireAll from '../../classes/requireAll'

const docs = requireAll(require.context('../../../docs/', true, /\.md$/))
for (const key in docs) {
  const newKey = key.replace('./', '')
  docs[newKey] = docs[key].default
  delete docs[key]
}
export default {
  names: Object.keys(docs),
  content: docs,
}

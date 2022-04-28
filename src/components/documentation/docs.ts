const docs = import.meta.glob('../../../docs/**/*.md')

for (const key in docs) {
  const newKey = key.replace('../../../docs/', '')
  docs[newKey] = docs[key]
  delete docs[key]
}

export default {
  names: Object.keys(docs),
  content: docs,
}

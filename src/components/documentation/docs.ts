const docs = import.meta.glob('../../../docs/**/*.md')
export default {
  names: Object.keys(docs),
  content: docs
}

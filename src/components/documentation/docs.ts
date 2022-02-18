// import requireAll from '../../classes/requireAll'

// const docs = requireAll(require.context('../../../docs/', true, /\.md$/))
const docs = import.meta.glob('../../../docs/**/*.md')
export default {
  names: Object.keys(docs),
  content: docs
}

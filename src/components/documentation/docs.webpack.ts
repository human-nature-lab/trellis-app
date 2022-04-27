import requireAll from '../../classes/requireAll'

const docs = requireAll(require.context('../../../docs/', true, /\.md$/))
export default {
  names: Object.keys(docs),
  content: docs,
}

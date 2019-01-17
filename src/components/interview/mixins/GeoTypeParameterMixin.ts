import Vue from 'vue'
import PT from '../../../static/parameter.types'
import Geo from "../../../entities/trellis/Geo";
const geoTypeNameReplacer = /[\W_]/g
export default Vue.extend({
  props: ['question'],
  computed: {
    allowedGeoTypes () {
      const types = []
      for (let qp of this.question.questionParameters) {
        if (qp.parameterId == PT.geo_type) {
          types.push(qp.val.replace(geoTypeNameReplacer, '').toLowerCase())
        }
      }
      return types
    }
  },
  methods: {
    isGeoSelectable (geo: Geo) {
      // If there are no geo type parameters then all geo types should be selectable
      if (this.question.questionParameters.filter(p => p.parameterId == PT.geo_type).length === 0) {
        return true
      }
      return this.allowedGeoTypes.indexOf(geo.geoType.name.replace(geoTypeNameReplacer, '').toLowerCase()) > -1
    }
  }
})

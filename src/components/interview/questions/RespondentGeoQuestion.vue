<template>
  <v-flex class="respondent-geo-question">
    <RespondentGeos
      :respondent="respondent"
      :study-id="global.study.id"
      :geoSelectionFilter="isGeoSelectable"
      @after-add="afterAdd"
      @after-move="afterMove"
      @after-remove="afterRemove" />
  </v-flex>
</template>

<script>
  import RespondentGeos from '../../respondent/RespondentGeos.vue'
  import AT from '../../../static/action.types'
  import ActionMixin from '../mixins/ActionMixin'
  import global from '../../../static/singleton'
  import GeoTypeParameterMixin from '../mixins/GeoTypeParameterMixin'
  export default {
    name: 'respondent-geo-question',
    data () {
      return {
        global
      }
    },
    props: {
      question: {
        type: Object,
        required: true
      },
      respondent: {
        type: Object,
        required: true
      }
    },
    methods: {
      afterMove (resGeo) {
        this.action(AT.respondent_move, {
          respondent_geo_id: resGeo.id,
          val: 'Move respondent'
        })
      },
      afterAdd (resGeo) {
        this.action(AT.respondent_add_geo, {
          respondent_geo_id: resGeo.id,
          val: 'Add respondent geo'
        })
      },
      afterRemove (resGeo) {
        this.action(AT.respondent_remove_geo, {
          respondent_geo_id: resGeo.id,
          val: 'Remove respondent geo'
        })
      }
    },
    mixins: [ActionMixin, GeoTypeParameterMixin],
    components: {RespondentGeos}
  }
</script>

<template>
  <span>
    <v-alert type="error" v-if="error">
      {{error}}
    </v-alert>
    <span>{{interpolatedText}}</span>
  </span>
</template>

<script>
  import StringInterpolationService from '@/services/StringInterpolationService'
  import {sharedInterview} from './models/Interview'
  import EdgeService from '@/services/edge/EdgeService'
  import RosterService from '@/services/roster/RosterService'

  export default {
    name: 'interpolated-text',
    props: {
      text: {
        type: String,
        required: true
      },
      sectionFollowUpDatumId: {
        type: String
      }
    },
    data: function () {
      return {
        error: null,
        isLoaded: false,
        isLoading: false,
        interpolatedText_: null
      }
    },
    computed: {
      interpolatedText: function () {
        this.loadInterpolatedValues(this.sectionFollowUpDatumId)
        if (this.interpolatedText_) {
          return this.interpolatedText_
        } else {
          let varNames = StringInterpolationService.getInterpolationKeys(this.text, this.sectionFollowUpDatumId)
          let fillMap = varNames.reduce(function (fillMap, name) {
            fillMap[name] = 'LOADING'
            return fillMap
          }, {})
          return StringInterpolationService.interpolate(this.text, fillMap)
        }
      }
    },
    methods: {
      getInterpolationPromises: function (varNames) {
        let interview = sharedInterview() // TODO: This is a stupid way to do this. Why isn't this just a singleton?
        let promises = []
        varNames.forEach(varName => {
          let questionDatum = interview.getSingleDatumByQuestionVarName(varName, this.sectionFollowUpDatumId)
          let question = interview.questionMap.get(questionDatum.question_id)
          let datum = this.sectionFollowUpDatumId ? questionDatum.data.find(d => d.id === this.sectionFollowUpDatumId) : questionDatum.data[0]
          switch (question.question_type.name) {
            case 'relationship':
              return promises.push(EdgeService.getEdges([datum.edge_id]).then(edges => {
                return {
                  key: varName,
                  name: edges[0].target_respondent.name
                }
              }))
            case 'roster':
              return promises.push(RosterService.getRosterRows(questionDatum.data.map(d => d.roster_id)).then(rosters => {
                return {
                  key: varName,
                  name: rosters[0].val
                }
              }))
            default:
              return promises.push(new Promise(resolve => {
                return {
                  key: varName,
                  name: datum.val
                }
              }))
          }
        })
        return promises
      },
      loadInterpolatedValues: function (sectionFollowUpDatumId) {
        let varNames = StringInterpolationService.getInterpolationKeys(this.text, sectionFollowUpDatumId)
        if (!varNames.length) {
          this.isLoaded = true
          this.isLoading = false
          return
        }
        this.isLoaded = false
        this.isLoading = true
        Promise.all(this.getInterpolationPromises(varNames)).then(fills => {
          let fillMap = fills.reduce((fillMap, fill) => {
            fillMap[fill.key] = fill.name/* + '_INTERPOLATED' */
            return fillMap
          }, {})
          this.interpolatedText_ = StringInterpolationService.interpolate(this.text, fillMap)
          this.isLoading = false
          this.isLoaded = true
        }).catch(err => {
          this.error = err
          this.isLoading = false
          this.isLoaded = false
        })
      }
    }
  }
</script>

<style scoped>

</style>

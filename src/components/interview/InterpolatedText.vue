<template>
  <v-flex>
    <debug :name="`Text loaded: ${isLoaded}, Text loading: ${isLoading}`"></debug>
    <v-alert type="error" v-if="error">
      {{error}}
    </v-alert>
    <p>{{loadedText}}</p>
  </v-flex>
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
      }
    },
    data: function () {
      return {
        error: null,
        isLoaded: false,
        isLoading: false,
        loadedText: this.text
      }
    },
    created: function () {
      this.loadInterpolatedValues()
    },
    methods: {
      getInterpolationPromises: function (varNames) {
        let interview = sharedInterview() // TODO: This is a stupid way to do this. Why isn't this just a singleton?
        let promises = []
        varNames.forEach(varName => {
          let questionDatum = interview.getSingleDatumByQuestionVarName(varName, interview.navigator.sectionFollowUpDatumId)
          let question = interview.questionMap.get(questionDatum.question_id)
          switch (question.question_type.name) {
            case 'relationship':
              return promises.push(EdgeService.getEdges([questionDatum.data[0].edge_id]).then(edges => {
                return {
                  key: varName,
                  name: edges[0].target_respondent.name
                }
              }))
            case 'roster':
              return promises.push(RosterService.getRosterRows(questionDatum.data.map(d => d.roster_id))).then(rosters => {
                return {
                  key: varName,
                  name: rosters[0].val
                }
              })
            default:
              return promises.push(new Promise(resolve => {
                return {
                  key: varName,
                  name: question.data[0].val
                }
              }))
          }
        })
        return promises
      },
      loadInterpolatedValues: function () {
        let varNames = StringInterpolationService.getInterpolationKeys(this.text)
        if (!varNames.length) {
          this.isLoaded = true
          this.isLoading = false
          return
        }
        this.isLoaded = false
        this.isLoading = true
        Promise.all(this.getInterpolationPromises(varNames)).then(fills => {
          let fillMap = fills.reduce((fillMap, fill) => {
            fillMap[fill.key] = fill.name + '_INTERPOLATED'
            return fillMap
          }, {})
          this.loadedText = StringInterpolationService.interpolate(this.text, fillMap)
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

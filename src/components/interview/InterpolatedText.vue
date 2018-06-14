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
  import {sharedInterview} from './classes/Interview'
  import EdgeService from '@/services/edge/EdgeService'
  import RosterService from '@/services/roster/RosterService'

  let oldText = ''
  export default {
    name: 'interpolated-text',
    props: {
      text: {
        type: String,
        required: true
      },
      location: {
        type: Object,
        required: true
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
    updated: function () {
      if (this.text !== oldText) {
        this.loadInterpolatedValues()
      }
    },
    created: function () {
      this.loadInterpolatedValues()
    },
    computed: {
      interpolatedText: function () {
        if (this.interpolatedText_) {
          return this.interpolatedText_
        } else {
          let varNames = StringInterpolationService.getInterpolationKeys(this.text)
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
          if (varName === 'CHILD ROSTER X') {
            promises.push(new Promise(resolve => {
              return resolve({
                key: varName,
                name: varName
              })
            }))
            return
          }
          try {
            let questionDatum = interview.getSingleDatumByQuestionVarName(varName, this.location.sectionFollowUpDatumRepetition)
            let question = interview.questionMap.get(questionDatum.question_id)
            // let datum = this.sectionFollowUpRepetition ? questionDatum.data.find(d => d.id === this.location) : questionDatum.data[0]
            let datum = questionDatum.data.find(d => d.event_order === this.location.sectionFollowUpDatumRepetition)
            console.log('datumId:', datum.id)
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
                  let roster = rosters.find(r => r.id === datum.roster_id)
                  return {
                    key: varName,
                    name: roster.val
                  }
                }))
              default:
                return promises.push(new Promise(resolve => {
                  return resolve({
                    key: varName,
                    name: datum.val
                  })
                }))
            }
          } catch (err) {
            let fill = interview.getRespondentFillByVarName(varName)
            if (fill) {
              return promises.push(new Promise(resolve => {
                return resolve({
                  key: varName,
                  name: fill
                })
              }))
            } else {
              return promises.push(new Promise(resolve => resolve({
                key: varName,
                name: 'NO FILL FOUND'
              })))
            }
          }
        })
        return promises
      },
      loadInterpolatedValues: function () {
        oldText = this.text
        this.interpolatedText_ = null
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

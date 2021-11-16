<template>
  <div>
    <v-progress-linear v-if="isLoading || !component" indeterminate/>
    <component v-else :is="component" v-bind="Object.assign({}, $props, $data)" />
  </div>
</template>

<script lang="ts">

  import Vue, { PropOptions, Component } from 'vue'
  import InterpolationService from '../../services/InterpolationService'
  import StringInterpolationService from '../../services/StringInterpolationService'
  import InterviewManager, { sharedInterviewInstance } from './classes/InterviewManager'
  import { InterviewLocation } from './services/InterviewAlligator'
  import Photo from '../photo/Photo.vue'
  import Question from '../../entities/trellis/Question'
  import QuestionDatum from '../../entities/trellis/QuestionDatum'
  import EdgeService from '../../services/edge/EdgeService'
  import GeoService from '../../services/geo/GeoService'
  import RosterService from '../../services/roster/RosterService'
  import questionTypes from '../../static/question.types'
  import Datum from '../../entities/trellis/Datum'
  import Respondent from '../../entities/trellis/Respondent'
  import Geo from '../../entities/trellis/Geo'
  import singleton from '../../static/singleton'
  import TranslationTextService from '../../services/translation-text/TranslationTextService'
  import TranslationService from '../../services/TranslationService'
  
  const vueKeywords = new Set(['_isVue', 'state', 'render', 'data', 'computed', 'props'])

  function DataHandler (location: InterviewLocation): ProxyHandler<Record<string | symbol, Datum[]>> {
    return {
      get (target, key, receiver) {
        if (target[key] || typeof key === 'symbol' || vueKeywords.has(key)) {
          return target[key]
        }
        const { data } = InterpolationService.getVarData(key as string, sharedInterviewInstance, location)
        Vue.set(target, key, data)
      }
    }
  }

  function ConditionTagHandler (location: InterviewLocation): ProxyHandler<Record<string | symbol, boolean>> {
    return {
      get (target, key, receiver) {
        if (target[key] || typeof key === 'symbol' || vueKeywords.has(key)) {
          return target[key]
        }
        const tags: string[] = sharedInterviewInstance.getConditionTags(location.sectionRepetition, location.sectionFollowUpDatumId)
        return tags.includes(key)
      }
    }
  }
  
  function VarsHandler (location: InterviewLocation): ProxyHandler<Record<string | symbol, any>> {
    return {
      get (target, key, receiver) {
        if (target[key] || typeof key === 'symbol' || vueKeywords.has(key)) {
          return target[key]
        }

        // Get the datum for the referenced var_name
        const { question, datum, data } = InterpolationService.getVarData(key as string, sharedInterviewInstance, location)

        // Select the correct data handler
        let handler: () => Promise<any>
        switch (question.questionTypeId) {
          case (questionTypes.relationship):
            handler = async () => {
              const edgeIds = data.filter(d => !!d.edgeId).map(d => d.edgeId)
              return EdgeService.getEdges(edgeIds)
            }
            break
          case (questionTypes.roster):
            handler = async () => {
              const rosterIds = data.filter(d => !!d.rosterId).map(d => d.rosterId)
              return RosterService.getRosterRows(rosterIds)
            }
            break
          case (questionTypes.geo):
            handler = async () => {
              const geoIds = data.filter(d => !!d.geoId).map(d => d.geoId)
              return GeoService.getGeosById(geoIds)
            }
            break
          default:
            target[key] = data
            return target[key]
        }

        // Set loading flag
        if (!target._loading) {
          // @ts-ignore
          target._loading = {}
        }
        if (target._loading[key]) {
          return
        }

        // Fetch the data
        target._loading[key] = true
        handler().then(res => {
          Vue.set(target, key, res)
        }).catch(err => {
          Vue.set(target, key, err)
        }).then(() => {
          target._loading[key] = false
        })
      }
    }
  }

  export default Vue.extend({
    name: 'QuestionText',
    props: {
      subject: Object as PropOptions<Respondent | Geo>,
      question: Object as PropOptions<Question>,
      location: Object as PropOptions<InterviewLocation>,
    },
    data () {
      return {
        isLoading: false,
        vars: new Proxy({}, VarsHandler(this.location)) as Record<string, any>,
        data: new Proxy({}, DataHandler(this.location)) as Record<string, Datum[]>,
        conditionTag: new Proxy({}, ConditionTagHandler(this.location) as Record<string, boolean>),
        fills: {} as Record<string, string>,
        global: singleton,
        translation: this.question ? this.question.questionTranslation : null,
      }
    },
    created () {
      this.convertTemplate()
      this.updateFills()
    },
    watch: {
      'question' (newQuestion: Question, oldQuestion: Question) {
        if (!oldQuestion || newQuestion.questionTranslationId !== oldQuestion.questionTranslationId) {
          this.convertTemplate()
        }
      },
      'location': {
        deep: true,
        handler () {
          this.updateFills()
        },
      },
    },
    methods: {
      async convertTemplate () {
        if (!this.question || this.isLoading) {
          return
        }
        this.translation = null
        try {
          const trans = this.question.questionTranslation
          if (trans && (!trans.translationText || !trans.translationText.length)) {
            this.isLoading = true
            this.question.questionTranslation.translationText = await TranslationTextService.getTranslatedTextByTranslationId(trans.id)
          }
        } catch (err) {
          this.log(err)
        }
        this.translation = this.question.questionTranslation
        if (this.isLoading) {
          this.updateFills()
        }
        this.isLoading = false
      },
      async updateFills () {
        if (!this.useOldFills) return
        const fills = {}
        const keys = this.oldFillKeys.slice()
        for (const key of keys) {
          fills[key] = this.$t('loading')
        }
        this.fills = fills
        const data = await Promise.all(keys.map(key => InterpolationService.getFillByVarName(key, sharedInterviewInstance, this.location)))
        for (let i = 0; i < keys.length; i++) {
          fills[keys[i]] = data[i]
        }
        this.fills = fills
      }
    },
    computed: {
      component (): Component {
        let tmp = this.translated ? this.translated.trim() : 'Loading...'
        
        // Convert old string iterpolation into Vue templates
        if (this.useOldFills) {
          for (const key of this.oldFillKeys) {
            tmp = tmp.replace(`[${key}]`, `{{fills['${key}']}}`)
          }
        }

        // Ensure a single root to the component if we're using the old fill method
        if (this.useOldFills) {
          tmp = `<span>${tmp}</span>`
        }

        const compiled = Vue.compile(tmp)
        const keys = Object.keys(this.$props).concat(['vars', 'fills', 'data', 'conditionTag'])
        return {
          name: this.question.varName,
          components: { Photo },
          render: compiled.render,
          staticRenderFns: compiled.staticRenderFns,
          props: keys,
        }
      },
      useOldFills (): boolean {
        return this.translated ? this.translated.trim()[0] !== '<' : false
      },
      oldFillKeys (): string[] {
        return StringInterpolationService.getInterpolationKeys(this.translated)
      },
      questionDatum (): QuestionDatum {
        return this.question.datum || sharedInterviewInstance.getSingleDatumByQuestionVarName(this.question.varName, this.location.sectionFollowUpDatumId)
      },
      translated (): string | null {
        return this.translation ? TranslationService.getAny(this.translation, this.global.locale) : null
      },
      followUpDatum (): Datum | undefined {
        if (this.questionDatum && this.questionDatum.followUpDatumId) {
          const int = sharedInterviewInstance as InterviewManager
          return int.data.getDatumById(this.questionDatum.followUpDatumId)
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>
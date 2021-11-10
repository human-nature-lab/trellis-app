<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import InterpolationService from '../../services/InterpolationService'
  import StringInterpolationService from '../../services/StringInterpolationService'
  import InterviewManager, { sharedInterviewInstance } from './classes/InterviewManager'
  import { InterviewLocation } from './services/InterviewAlligator'
  import Photo from '../photo/Photo.vue'
  import Question from '../../entities/trellis/Question'
  import QuestionDatum from '../../entities/trellis/QuestionDatum'
  import EdgeService from '../../services/edge/EdgeService'
  import GeoService from '../../services/geo/GeoService'
  import TranslationMixin from '../../mixins/TranslationMixin'
  import Translation from '../../entities/trellis/Translation'
  import RosterService from '../../services/roster/RosterService'
  import questionTypes from '../../static/question.types'
  import Datum from '../../entities/trellis/Datum'
  
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
    components: { Photo },
    mixins: [TranslationMixin],
    props: {
      question: Object as PropOptions<Question>,
      location: Object as PropOptions<InterviewLocation>,
    },
    data () {
      return {
        vars: new Proxy({}, VarsHandler(this.location)) as Record<string, any>,
        data: new Proxy({}, DataHandler(this.location)) as Record<string, Datum[]>,
        fills: {} as Record<string, string>,
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
      }
    },
    methods: {
      convertTemplate () {
        if (!this.question || !this.translated) {
          this.$options.template = '<span />'
          return
        }
        let tmp = this.translated.trim()
        
        // Convert old string iterpolation into Vue templates
        if (this.useOldFills) {
          for (const key of this.oldFillKeys) {
            tmp = tmp.replace(`[${key}]`, `{{fills.${key}}}`)
          }
        }

        // Add a single root to the component if we're using old fill method
        if (this.useOldFills) {
          tmp = `<span>${tmp}</span>`
        }

        this.$options.template = tmp
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
      useOldFills (): boolean {
        return this.translated.trim()[0] !== '<'
      },
      oldFillKeys (): string[] {
        return StringInterpolationService.getInterpolationKeys(this.translated)
      },
      questionDatum (): QuestionDatum {
        return this.question.datum || sharedInterviewInstance.getSingleDatumByQuestionVarName(this.question.varName, this.location.sectionFollowUpDatumId)
      },
      translation (): Translation {
        return this.question.questionTranslation
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
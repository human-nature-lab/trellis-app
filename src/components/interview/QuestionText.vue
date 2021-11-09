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
  import Datum from '../../entities/trellis/Datum'
  import Geo from '../../entities/trellis/Geo'
  import Edge from '../../entities/trellis/Edge'
  import TranslationMixin from '../../mixins/TranslationMixin'
  import Translation from '../../entities/trellis/Translation'
  import Roster from '../../entities/trellis/Roster'
  import RosterService from '../../services/roster/RosterService'
  
  const vueKeywords = new Set(['_isVue', 'state', 'render', 'data', 'computed', 'props'])

  function loadData<T extends any> (target: any, key: string | symbol, location: InterviewLocation, handler: (data: { question: Question, data: Datum[], datum: QuestionDatum }) => Promise<T>): Promise<T> {
    if (!target._loading) {
      // @ts-ignore
      target._loading = {}
    }
    if (target._loading[key]) {
      return
    }
    const data = InterpolationService.getVarData(key as string, sharedInterviewInstance, location)
    target._loading[key] = true
    handler(data).then(res => {
      Vue.set(target, key, res)
      target[key] = res
    }).catch(err => {
      Vue.set(target, key, err)
    }).then(() => {
      target._loading[key] = false
    })
  }

  function EdgeHandler(location: InterviewLocation): ProxyHandler<Record<string | symbol, Edge[] | undefined>> {
    return {
      get (target, key, receiver) {
        if (target[key] || typeof key === 'symbol' || vueKeywords.has(key)) {
          return target[key]
        }
        loadData(target, key, location, async ({ data }) => {
          const edgeIds = data.filter(d => !!d.edgeId).map(d => d.edgeId)
          return EdgeService.getEdges(edgeIds)
        })
        return
      }
    }
  }

  function GeoHandler (location: InterviewLocation): ProxyHandler<Record<string | symbol, Geo[] | undefined>> {
    return {
      get (target, key, receiver) {
        if (target[key] || typeof key === 'symbol' || vueKeywords.has(key)) {
          return target[key]
        }
        loadData(target, key, location, async ({ data }) => {
          const geoIds = data.filter(d => !!d.geoId).map(d => d.geoId)
          return GeoService.getGeosById(geoIds)
        })
        return
      }
    }
  }

  function RosterHandler (location: InterviewLocation): ProxyHandler<Record<string | symbol, Roster[] | undefined>> {
    return {
      get (target, key, receiver) {
        if (target[key] || typeof key === 'symbol' || vueKeywords.has(key)) {
          return target[key]
        }
        loadData(target, key, location, async ({ data }) => {
          const rosterIds = data.filter(d => !!d.rosterId).map(d => d.rosterId)
          return RosterService.getRosterRows(rosterIds)
        })
        return
      }
    }
  }

  function DataHandler (location: InterviewLocation): ProxyHandler<Record<string | symbol, Datum[]>> {
    return {
      get (target, key, receiver) {
        if (target[key] || typeof key === 'symbol' || vueKeywords.has(key)) {
          return target[key]
        }
        const data = InterpolationService.getVarData(key as string, sharedInterviewInstance, location)
        Vue.set(target, key, data)
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
        data: new Proxy({}, DataHandler(this.location)) as Record<string, Datum[]>,
        edge: new Proxy({}, EdgeHandler(this.location)) as Record<string, Edge[]>,
        geo: new Proxy({}, GeoHandler(this.location)) as Record<string, Geo[]>,
        roster: new Proxy({}, RosterHandler(this.location)) as Record<string, Roster[]>,
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
      },
      async getEdge (id: string): Promise<Edge> {
        const edges = await EdgeService.getEdges([id])
        return edges[0]
      }
    },
    computed: {
      useOldFills (): boolean {
        return this.translated.trim()[0] !== '<'
      },
      oldFillKeys (): string[] {
        return StringInterpolationService.getInterpolationKeys(this.translated)
      },
      locationStr (): string {
        return JSON.stringify(this.location)
      },
      pageQuestions (): Question[] {
        const int = sharedInterviewInstance as InterviewManager
        return int.getCurrentPageQuestions()
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
<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import InterpolationService from '../../services/InterpolationService'
  import StringInterpolationService from '../../services/StringInterpolationService'
  import InterviewManager, { sharedInterviewInstance } from './classes/InterviewManager'
  import { InterviewLocation } from './services/InterviewAlligator'
  import Photo from '../photo/Photo.vue'
  import Question from '../../entities/trellis/Question'
  import QuestionDatum from '../../entities/trellis/Question'
  import EdgeService from '../../services/edge/EdgeService'
  import Datum from '../../entities/trellis/Datum'
  import { AsyncCacheMixin, AsyncObj } from '../../mixins/AsyncCacheMixin'
  import TranslationMixin from '../../mixins/TranslationMixin'
  import Translation from '../../entities/trellis/Translation'
  import Geo from '../../entities/trellis/Geo'
  import AsyncDataFetcher from '../AsyncDataFetcher.vue'
  import Edge from '../../entities/trellis/Edge'
  import Respondent from '../../entities/trellis/Respondent'
  import RespondentService from '../../services/respondent/RespondentService'

  function RespondentHandler(location: InterviewLocation): ProxyHandler<Record<string | symbol, Edge[] | undefined>> {
    return {
      get (target, key, receiver) {
        console.log('get', key, 'on', target, receiver)
        if (typeof key === 'symbol' || key.startsWith('_') || key === 'state') {
          return target[key]
        }
        if (target[key]) {
          console.log('returning val')
          return target[key]
        }
        if (!target._loading) {
          // @ts-ignore
          target._loading = {}
        }
        if (target._loading[key]) {
          console.log('already loading')
          return
        }
        const { question, datum, data } = InterpolationService.getVarData(key as string, sharedInterviewInstance, location)
        target._loading[key] = true
        console.log(data)
        if (data.length) {
          const edgeIds = data.map(d => d.edgeId)
          EdgeService.getEdges(edgeIds).then((edges: Edge[]) => {
            console.log('loaded edges')
            target[key] = edges
            target._loading[key] = false
          }).catch(err => {
            console.error(err)
            target[key] = err
          })
        }
        return
      }
    }
  }

  export default Vue.extend({
    name: 'QuestionText',
    components: { Photo, AsyncDataFetcher },
    mixins: [TranslationMixin],
    props: {
      question: Object as PropOptions<Question>,
      location: Object as PropOptions<InterviewLocation>,
    },
    data () {
      return {
        data: {} as Record<string, Datum>,
        respondent: new Proxy({}, RespondentHandler(this.question)),
        edge: {} as Record<string, Edge>,
        geo: {} as Record<string, Geo>,
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
        }
      }
    },
    methods: {
      convertTemplate () {
        console.log('converting template')
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

        console.log('setting template', tmp)
        this.$options.template = tmp
      },
      async updateFills () {
        if (!this.useOldFills) return
        const fills = {}
        const keys = this.oldFillKeys.slice()
        console.log('updateFills', keys)
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
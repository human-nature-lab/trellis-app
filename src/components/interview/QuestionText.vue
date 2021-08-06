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
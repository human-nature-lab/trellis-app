import Vue, { PropOptions } from 'vue'
import ConditionTag from '../entities/trellis/ConditionTag'
import Locale from '../entities/trellis/Locale'
import Question from '../entities/trellis/Question'
import QuestionType from '../entities/trellis/QuestionType'

export default Vue.extend({
  props: {
    locale: Object as PropOptions<Locale>,
    questions: Object as PropOptions<Record<string, Question>>,
    conditionTags: Array as PropOptions<ConditionTag[]>,
    questionTypes: Array as PropOptions<QuestionType[]>,
  }
})
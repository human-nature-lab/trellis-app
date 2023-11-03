import { inject } from 'vue'
import { builder } from '@/symbols/builder'
import ConditionTag from '@/entities/trellis/ConditionTag'
import Form from '@/entities/trellis/Form'
import GeoType from '@/entities/trellis/GeoType'
import Locale from '@/entities/trellis/Locale'
import Parameter from '@/entities/trellis/Parameter'
import QuestionType from '@/entities/trellis/QuestionType'

type BuilderState = {
  form?: Form,
  locale?: Locale,
  locked: boolean,
  questionTypes: QuestionType[],
  parameters: Parameter[],
  conditionTags: ConditionTag[],
  geoTypes: GeoType[],
}

export function useBuilder () {
  return inject<BuilderState>(builder)
}

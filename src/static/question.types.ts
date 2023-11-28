import { ParameterType as PT } from './parameter.types'

const qt = {
  time: '06162912-8048-4978-a8d2-92b6dd0c2ed1',
  multiple_select: '0f76b96f-613a-4925-bacd-74db45368edb',
  image: '1e9e577d-524c-4af1-bd70-26b561e14710',
  relationship: '2ab4a309-5c65-4eec-a044-c75a89ba25f1',
  integer: '2d3ff07a-5ab1-4da0-aa7f-440cf8cd0980',
  decimal: '312533dd-5957-453c-ab00-691f869d257f',
  group: '49c03474-cbe8-4f4c-ab10-6491f936338f',
  roster: '5ae659b6-8945-4adc-86d5-a44b51531def',
  text: '948ffae0-bfb3-4cf1-a3e9-b4845181cb61',
  text_area: '99e769a7-c2b3-41ae-98a3-9b7afbfc4a45',
  multiple_choice: 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
  geo: 'c35db71d-cb10-49c7-909c-e67a9a29e736',
  intro: 'cebe05f8-8e17-4c5c-a5fa-abc3a9c6c1f9',
  year: 'd566e086-c95e-45aa-9b3f-e88cb1802081',
  year_month: 'd840f8cb-b68b-432a-9a47-2b0b5dc65377',
  year_month_day: 'efbafb7c-62ca-4ed9-92df-7d171e855650',
  year_month_day_time: 'effab4ce-df07-459d-a2a4-25be77bcca1b',
  respondent_geo: 'db1192c9-a850-4427-ad67-388f6325fd23',
  distribution: 'd9a2de9f-411a-11ee-81c8-0242ac120003',
  social_ring: 'adf49a4d-79a4-11ee-80e7-0242ac120004',
}

export const choiceTypes = [qt.multiple_choice, qt.multiple_select]
export const builderTypes = [qt.distribution, qt.social_ring]

export function isBuilderType (typeId: string) {
  return builderTypes.includes(typeId)
}

// Here we create the list of accepted parameters for each question type
const defaultParams = [PT.show_dk, PT.show_rf, PT.is_required, PT.read_only, PT.allowed_time, PT.show_timer_controls]
const questionTypeParameters: Record<typeof qt[keyof typeof qt], PT[]> = {
  [qt.time]: [PT.min_time, PT.max_time],
  [qt.multiple_select]: [PT.other, PT.exclusive],
  [qt.image]: [PT.min, PT.max],
  [qt.relationship]: [
    PT.min_relationships,
    PT.max_relationships,
    PT.and_respondent_condition_tag,
    PT.or_respondent_condition_tag,
    PT.can_add_respondent,
    PT.hide_no_one,
    PT.dictator_receiver,
  ],
  [qt.integer]: [PT.min, PT.max],
  [qt.decimal]: [PT.min, PT.max, PT.step_size],
  [qt.group]: [],
  [qt.roster]: [PT.allow_barcode, PT.min_roster, PT.max_roster],
  [qt.text]: [PT.allow_barcode],
  [qt.text_area]: [PT.allow_barcode],
  [qt.multiple_choice]: [PT.other, PT.exclusive],
  [qt.geo]: [PT.geo_type, PT.min_geos, PT.max_geos],
  [qt.intro]: [],
  [qt.year]: [PT.min_date, PT.max_date],
  [qt.year_month]: [PT.min_date, PT.max_date],
  [qt.year_month_day]: [PT.min_date, PT.max_date],
  [qt.year_month_day_time]: [PT.min_date, PT.max_date, PT.min_time, PT.max_time],
  [qt.respondent_geo]: [PT.geo_type],
  [qt.distribution]: [PT.json, PT.dictator_decision],
  [qt.social_ring]: [PT.json],
}

for (const key in questionTypeParameters) {
  questionTypeParameters[key] = questionTypeParameters[key].concat(defaultParams)
}

export const QuestionTypeParameters = Object.freeze(questionTypeParameters)

export default qt

const allQuestionTypes = {
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

export const choiceTypes = [allQuestionTypes.multiple_choice, allQuestionTypes.multiple_select]
export const builderTypes = [allQuestionTypes.distribution, allQuestionTypes.social_ring]

export function isBuilderType (typeId: string) {
  return builderTypes.includes(typeId)
}

export default allQuestionTypes

// import uuid from 'uuid/v4'
export default {
  'select-choice': function (dataStore, payload, questionDatum, questionData) {
    // questionData.push({
    //   datum_id: uuid(),
    //   val: question.choices.find(choice => choice.id === action.choice_id)
    // })
    // dataStore.setQuestionData(questionData, question.id)
  },
  'deselect-choice': function (dataStore, payload, questionDatum, questionData) {
    // let data = question.data
    // dataStore.setQuestionData(question.id)
  },
  'next': function (dataStore, payload, questionDatum = null, questionData = null, interviewNavigator) {
    interviewNavigator.next()
  },
  'previous': function (dataStore, payload, questionDatum = null, questionData = null, interviewNavigator) {
    interviewNavigator.previous()
  },
  'type-text': function (dataStore, payload, questionDatum, questionData) {
    dataStore.getQuestion(payload.question_id, payload.sectionId, payload.pageId, payload.followUpReptitionId, payload.repetitionId)
  }
}

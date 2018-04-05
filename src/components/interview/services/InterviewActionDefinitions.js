// import uuid from 'uuid/v4'
export default {
  'select-choice': function (interview, payload, questionDatum, questionData) {
    // questionData.push({
    //   datum_id: uuid(),
    //   val: question.choices.find(choice => choice.id === action.choice_id)
    // })
    // interview.setQuestionData(questionData, question.id)
  },
  'deselect-choice': function (interview, payload, questionDatum, questionData) {
    // let data = question.data
    // interview.setQuestionData(question.id)
  },
  'dk-rf': function (interview, payload, questionDatum, questionData) {
    if (questionDatum) {
      questionDatum.dk_rf = payload.dk_rf // True or false
    }
    if (questionData && questionData.length) {
      interview.deleteQuestionDatumData(questionDatum)
    }
  },
  'dk-rf-reason': function (interview, payload, questionDatum) {

  },
  'next': function (interview) {
    interview.next()
  },
  'previous': function (interview) {
    interview.previous()
  },
  'type-text': function (interview, payload, questionDatum, questionData) {
    // interview.getQuestion(payload.question_id, payload.sectionId, payload.pageId, payload.followUpReptitionId, payload.repetitionId)
  }
}

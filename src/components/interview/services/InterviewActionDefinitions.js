import uuidv4 from 'uuid/v4'
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
  'dk-rf-val': function (interview, payload, questionDatum) {
    if (questionDatum) {
      questionDatum.dk_rf_val = payload.dk_rf_val
    } else {
      console.error('dk-rf-val', 'invalid input without a questionDatum', payload)
    }
  },
  'next': function (interview) {
    interview.next()
  },
  'previous': function (interview) {
    interview.previous()
  },
  'type-text': function (interview, payload, questionDatum, questionData) {
    // interview.getQuestion(payload.question_id, payload.sectionId, payload.pageId, payload.followUpReptitionId, payload.repetitionId)
  },
  'new-roster-row': function (interview, payload, questionDatum, questionData) {
    questionData.push({
      id: uuidv4(),
      val: '',
      sort_order: payload.sort_order
    })
  },
  'roster-row-edit': function (interview, payload, questionDatum, questionData) {
    let datum = questionData.find(d => d.id === payload.datum_id)
    if (datum) {
      datum.val = payload.val
    } else {
      console.error('roster-row-edit', 'invalid input. No datum has been created with that id')
    }
  }
}

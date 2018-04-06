import uuidv4 from 'uuid/v4'
export default {
  'select-choice': function (interview, payload, questionDatum, questionData) {
    questionData.push({
      id: uuidv4(),
      val: payload.choice_id,
      choice_id: payload.choice_id
    })
  },
  'deselect-choice': function (interview, payload, questionDatum, questionData) {
    let index = questionData.findIndex(d => d.choice_id === payload.choice_id)
    if (index > -1) {
      interview.deleteSingleQuestionDatumDatum(questionDatum, questionData[index])
    } else {
      console.error('deselect-choice', 'invalid input without an already selected choice with that id')
    }
  },
  'dk-rf': function (interview, payload, questionDatum, questionData) {
    if (questionDatum) {
      questionDatum.dk_rf = payload.dk_rf // True or false
    }
    if (questionData && questionData.length) {
      interview.deleteAllQuestionDatumData(questionDatum)
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

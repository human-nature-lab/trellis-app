import uuidv4 from 'uuid/v4'

/**
 * All action handlers are given access to the interview, the action payload, the questionBlueprint and the questionDatum
 * with the datum associated with the question datum at questionDatum.datum
 */
export default {
  'select-choice': function (interview, payload, questionDatum, questionBlueprint) {
    let choiceBlueprint = questionBlueprint.choices.find(choice => choice.id === payload.choice_id)
    let shouldRemoveOthers = questionBlueprint.question_type.name === 'multiple_choice'
    let paramMap = new Map()

    // Handle any parameters on the choice being selected
    let choiceHasOtherInput = false
    for (let param of questionBlueprint.question_parameters) {
      paramMap.set(param.val, param.parameter)
      if (choiceBlueprint.val === param.val) {
        if (param.parameter.name === 'other_exclusive' || param.parameter.name === 'other') {
          choiceHasOtherInput = true
        }
        if (param.parameter.name === 'other_exclusive') {
          shouldRemoveOthers = true
        }
      }
    }

    // Remove any other exclusive choices that are currently selected
    for (let i = 0; i < questionDatum.data.length; i++) {
      let p = paramMap.get(questionDatum.data[i].val)
      if (p && p.name === 'other_exclusive') {
        questionDatum.data.splice(i, 1)
      }
    }

    if (shouldRemoveOthers) {
      questionDatum.data = [] // This could break references... shouldn't be a since we're trying to pass around copies
    }
    let datum = {
      id: uuidv4(),
      val: choiceBlueprint.val,
      choice_id: payload.choice_id
    }
    if (choiceHasOtherInput) {
      datum.other_input = '' // TODO: Handle the visibility of the other_input textbox for a choice
    }
    questionDatum.data.push(datum)
  },
  'deselect-choice': function (interview, payload, questionDatum, questionBlueprint) {
    let index = questionDatum.data.findIndex(d => d.choice_id === payload.choice_id)
    if (index > -1) {
      interview.deleteSingleQuestionDatumDatum(questionDatum, index)
    } else {
      console.error('deselect-choice', 'invalid input without an already selected choice with that id')
    }
  },
  'dk-rf': function (interview, payload, questionDatum, questionBlueprint) {
    if (questionDatum) {
      questionDatum.dk_rf = payload.dk_rf // True or false
    }
    if (questionDatum.data && questionDatum.data.length) {
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
  'type-text': function (interview, payload, questionDatum, questionBlueprint) {
    // interview.getQuestion(payload.question_id, payload.sectionId, payload.pageId, payload.followUpReptitionId, payload.repetitionId)
  },
  'new-roster-row': function (interview, payload, questionDatum, questionBlueprint) {
    questionDatum.data.push({
      id: uuidv4(),
      val: '',
      sort_order: payload.sort_order
    })
  },
  'roster-row-edit': function (interview, payload, questionDatum, questionBlueprint) {
    let datum = questionDatum.data.find(d => d.id === payload.datum_id)
    if (datum) {
      datum.val = payload.val
    } else {
      console.error('roster-row-edit', 'invalid input. No datum has been created with that id')
    }
  }
}

import DatumRecycler from './DatumRecycler'

// Options
const shouldRemoveDkRfResponsesOnDeselect = false   // Indicate if dk_rf_val should be removed when dk_rf is set to null. This should likely be a property of the form

/**
 * All action handlers are given access to the interview, the action payload, the questionBlueprint and the questionDatum
 * with the datum associated with the question datum at questionDatum.datum. DatumRecycler should be used whenver new
 * datum are being created so that the ids are recycled
 */
const definitions = {
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
    let datum = DatumRecycler.getNoKey(questionDatum, payload)
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
      // Optionally remove dk_rf responses if they deselect dk_rf
      if (shouldRemoveDkRfResponsesOnDeselect && questionDatum.dk_rf === null) {
        questionDatum.dk_rf_val = null
      }
    }
    // Uncomment this if we want to remove datum associated with this question
    // if (questionDatum.data && questionDatum.data.length) {
    //   interview.deleteAllQuestionDatumData(questionDatum)
    // }
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
    interview.replayTo(interview.location.section, interview.location.page)
  },
  'previous': function (interview) {
    interview.previous()
    interview.replayTo(interview.location.section, interview.location.page)
  },
  'type-text': function (interview, payload, questionDatum, questionBlueprint) {
    // interview.getQuestion(payload.question_id, payload.sectionId, payload.pageId, payload.followUpReptitionId, payload.repetitionId)
  },
  'number-change': function (interview, payload, questionDatum) {
    if (!questionDatum.data.length) {
      questionDatum.data.push(DatumRecycler.getNoKey(questionDatum, payload))
    }
    questionDatum.data[0].val = payload.val
  },
  'add-edge': function (interview, payload, questionDatum) {
    questionDatum.data.push(DatumRecycler.getNoKey(questionDatum, payload))
  },
  'remove-edge': function (interview, payload, questionDatum) {
    let index = questionDatum.data.findIndex(datum => datum.edge_id === payload.edge_id)
    if (index > -1) {
      questionDatum.data.splice(index, 1)
    } else {
      throw new Error('No datum exists with this edge_id')
    }
  },
  'add-roster-row': function (interview, payload, questionDatum) {
    questionDatum.data.push(DatumRecycler.getNoKey(questionDatum, payload))
  },
  'remove-roster-row': function (interview, payload, questionDatum, questionBlueprint) {
    let index = questionDatum.data.findIndex(datum => datum.roster_id === payload.roster_id)
    if (index > -1) {
      questionDatum.data.splice(index, 1)
    } else {
      throw new Error('No datum exists with this roster id')
    }
  },
  'change-sort-order': function (interview, payload, questionDatum) {
    let datum = questionDatum.data.findIndex(datum => datum.id === payload.datum_id)
    if (datum) {
      datum.sort_order = payload.sort_order
    } else {
      throw new Error('No datum exists with this id: ' + payload.datum_id)
    }
  },
  'set-val': function (interview, payload, questionDatum) {
    if (!questionDatum.data.length) {
      questionDatum.data.push(DatumRecycler.getNoKey(questionDatum, payload))
    } else {
      questionDatum.data[0].val = payload.val
    }
  }
}

// Action aliases
definitions['set-date'] = definitions['set-val']
definitions['set-text'] = definitions['set-val']
definitions['set-time'] = definitions['set-val']

export default definitions

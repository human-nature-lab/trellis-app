import DatumRecycler from './recyclers/DatumRecycler'
import parameterTypes from '../../../static/parameter.types'
import AT from '../../../static/action.types'
import QT from '../../../static/question.types'

// Options
const shouldRemoveDkRfResponsesOnDeselect = false   // Indicate if dk_rf_val should be removed when dk_rf is set to null. This should likely be a property of the form

/**
 * All action handlers are given access to the interview, the action payload, the questionBlueprint and the questionDatum
 * with the datum associated with the question datum at questionDatum.datum. DatumRecycler should be used whenver new
 * datum are being created so that the ids are recycled
 */
const definitions = {}
definitions[AT.select_choice] = function (interview, payload, questionDatum, questionBlueprint) {
  let choiceBlueprint = questionBlueprint.choices.find(choice => choice.id === payload.choice_id)
  let shouldRemoveOthers = questionBlueprint.question_type_id === QT.multiple_choice
  let paramMap = new Map()

  // Handle any parameters on the choice being selected
  let choiceHasOtherInput = false
  for (let param of questionBlueprint.question_parameters) {
    paramMap.set(param.val, param.parameter)
    if (choiceBlueprint.val === param.val) {
      let pId = parseInt(param.parameter_id, 10)
      if (pId === parameterTypes.other) {
        choiceHasOtherInput = true
      }
      if (pId === parameterTypes.exclusive) {
        shouldRemoveOthers = true
      }
    }
  }

  // Remove any other exclusive choices that are currently selected
  let exclusiveParameter = questionBlueprint.question_parameters.find(p => parseInt(p.parameter_id, 10) === parameterTypes.exclusive)
  if (exclusiveParameter) {
    let choice = questionBlueprint.choices.find(c => c.val === exclusiveParameter.val)
    for (let i = 0; i < questionDatum.data.length; i++) {
      let datum = questionDatum.data[i]
      if (datum.choice_id === choice.id) {
        questionDatum.data.splice(i, 1)
        break
      }
    }
  }

  if (shouldRemoveOthers) {
    questionDatum.data = [] // This could break references... shouldn't be a since we're trying to pass around copies
  }
  let datum = DatumRecycler.getNoKey(questionDatum, payload)
  if (choiceHasOtherInput) {
    datum.val = ''
  }
  questionDatum.data.push(datum)
}

definitions[AT.deselect_choice] = function (interview, payload, questionDatum) {
  let index = questionDatum.data.findIndex(d => d.choice_id === payload.choice_id)
  if (index > -1) {
    interview.deleteSingleQuestionDatumDatum(questionDatum, index)
  } else {
    console.error('deselect-choice', 'invalid input without an already selected choice with that id')
  }
}

definitions[AT.other_choice_text] = function (interview, payload, questionDatum) {
  let datum = questionDatum.data.find(d => d.choice_id === payload.choice_id)
  if (datum) {
    datum.val = payload.val
  } else {
    console.error('other-choice-text', 'invalid input without an already selected choice with that id')
  }
}

definitions[AT.dk_rf] = function (interview, payload, questionDatum, questionBlueprint) {
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
}

definitions[AT.dk_rf_val] = function (interview, payload, questionDatum) {
  if (questionDatum) {
    questionDatum.dk_rf_val = payload.dk_rf_val
  } else {
    console.error('dk-rf-val', 'invalid input without a questionDatum', payload)
  }
}

definitions[AT.next] = function (interview, a, b, c, actionWasInitiatedByHuman) {
  if (actionWasInitiatedByHuman) {
    interview.nextAndReplay()
  } else {
    interview.next()
  }
  // interview.replayTo(interview.location.section, interview.location.page, interview.location.sectionRepetition, interview.location.sectionFollowUpDatumId)
}

definitions[AT.previous] = function (interview, a, b, c, actionWasInitiatedByHuman) {
  if (actionWasInitiatedByHuman) {
    interview.previousAndReplay()
  } else {
    interview.previous()
  }
  // interview.replayTo(interview.location.section, interview.location.page, interview.location.sectionRepetition, interview.location.sectionFollowUpDatumId)
}

definitions[AT.number_change] = function (interview, payload, questionDatum) {
  if (!questionDatum.data.length) {
    questionDatum.data.push(DatumRecycler.getNoKey(questionDatum, payload))
  }
  questionDatum.data[0].val = payload.val
}

definitions[AT.add_edge] = function (interview, payload, questionDatum) {
  questionDatum.data.push(DatumRecycler.getNoKey(questionDatum, payload))
}

definitions[AT.remove_edge] = function (interview, payload, questionDatum) {
  let index = questionDatum.data.findIndex(datum => datum.edge_id === payload.edge_id)
  if (index > -1) {
    questionDatum.data.splice(index, 1)
  } else {
    throw new Error('No datum exists with this edge_id')
  }
}

definitions[AT.add_roster_row] = function (interview, payload, questionDatum) {
  questionDatum.data.push(DatumRecycler.getNoKey(questionDatum, payload))
}

definitions[AT.remove_roster_row] = function (interview, payload, questionDatum, questionBlueprint) {
  let index = questionDatum.data.findIndex(datum => datum.roster_id === payload.roster_id)
  if (index > -1) {
    questionDatum.data.splice(index, 1)
  } else {
    throw new Error('No datum exists with this roster id')
  }
}

definitions[AT.change_sort_order] = function (interview, payload, questionDatum) {
  let datum = questionDatum.data.findIndex(datum => datum.id === payload.datum_id)
  if (datum) {
    datum.sort_order = payload.sort_order
  } else {
    throw new Error('No datum exists with this id: ' + payload.datum_id)
  }
}

definitions[AT.set_val] = function (interview, payload, questionDatum) {
  if (!questionDatum.data.length) {
    questionDatum.data.push(DatumRecycler.getNoKey(questionDatum, payload))
  } else {
    questionDatum.data[0].val = payload.val
  }
}

definitions[AT.remove_geo] = function (interview, payload, questionDatum) {
  let index = questionDatum.data.findIndex(datum => datum.geo_id === payload.geo_id)
  if (index > -1) {
    questionDatum.data.splice(index, 1)
  } else {
    throw new Error('No datum exists with this geo id')
  }
}

function addDatum (interview, payload, questionDatum) {
  questionDatum.data.push(DatumRecycler.getNoKey(questionDatum, payload))
}

/**
 * Add a datum and if we've exceed the supplied limit, we remove the oldest datum
 * @param {Number} limit
 * @returns {Function}
 */
function addDatumLimit (limit) {
  return function (interview, payload, questionDatum) {
    addDatum(interview, payload, questionDatum)
    if (questionDatum.data.length > limit) {
      questionDatum.data.shift()
    }
  }
}

definitions[AT.add_geo] = addDatum
definitions[AT.respondent_move] = addDatumLimit(1)
definitions[AT.respondent_add_geo] = addDatumLimit(1)
definitions[AT.respondent_remove_geo] = addDatumLimit(1)

// Action aliases
definitions[AT.set_date] = definitions[AT.set_val]
definitions[AT.set_text] = definitions[AT.set_val]
definitions[AT.set_time] = definitions[AT.set_val]

export default definitions

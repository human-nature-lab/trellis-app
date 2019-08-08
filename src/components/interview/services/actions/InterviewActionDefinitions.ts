import parameterTypes from '../../../../static/parameter.types'
import AT from '../../../../static/action.types'
import QT from '../../../../static/question.types'
import QuestionDatum from '../../../../entities/trellis/QuestionDatum'
import actionManager from './ActionManager'
import {
  addDatum,
  addDatumLimit,
  addOrUpdateSingleDatum,
  removeDatum,
  updateDatum,
  ActionPayload,
  removeAllDatum
} from './DatumOperations'
import Question from '../../../../entities/trellis/Question'
import InterviewManagerOld, {default as InterviewManager} from '../../classes/InterviewManager'
import Datum from '../../../../entities/trellis/Datum'
import Choice from '../../../../entities/trellis/Choice'
import Action from '../../../../entities/trellis/Action'

// Options
const shouldRemoveDkRfResponsesOnDeselect = false   // Indicate if dk_rf_val should be removed when dk_rf is set to null. This should likely be a property of the form

// Definitions
/**
 * All action handlers are given access to the interview, the action payload, the questionBlueprint and the questionDatum
 * with the datum associated with the question datum at questionDatum.datum. DatumRecycler should be used whenver new
 * datum are being created so that the ids are recycled
 */
actionManager.add(AT.select_choice, function (interview: InterviewManagerOld, action: Action, questionDatum: QuestionDatum, questionBlueprint: Question) {
  // The choice we are selecting
  let choice: Choice
  const choiceValMap: Map<string, Choice> = new Map()
  for (let qc of questionBlueprint.choices) {
    if (qc.choiceId === action.payload.choice_id) {
      choice = qc.choice
    }
    choiceValMap.set(qc.choice.val, qc.choice)
  }

  // Create an array of choices with the exclusive parameter
  let exclusiveChoices: string[] = []
  let otherChoices: string[] = []
  for (let qp of questionBlueprint.questionParameters) {
    if (+qp.parameterId === parameterTypes.exclusive) {
      exclusiveChoices.push(choiceValMap.get(qp.val).id)
    } else if (+qp.parameterId === parameterTypes.other) {
      otherChoices.push(choiceValMap.get(qp.val).id)
    }
  }

  // Remove all other choices if this one is an exclusive choice
  const shouldRemoveOthers: boolean = exclusiveChoices.indexOf(choice.id) > -1 || questionBlueprint.questionTypeId === QT.multiple_choice
  if (shouldRemoveOthers) {
    interview.data.removeAllDatum(questionDatum)
  }

  // Remove any selected exclusive choices
  const questionHasExclusive = exclusiveChoices.length > 0
  if (questionHasExclusive) {
    interview.data.filterDatum(questionDatum, (d: Datum) => {
      return exclusiveChoices.indexOf(d.choiceId) > -1
    })
  }

  // Add the selected datum
  const datum = addDatum(interview, action, questionDatum)

  // Reset the datum value to blank if the datum has the 'other' parameter
  if (otherChoices.indexOf(choice.id) > -1) {
    datum.val = ''
  }
})
actionManager.add(AT.deselect_choice, removeDatum((d, payload) => d.choiceId === payload.choice_id))
actionManager.add(AT.other_choice_text, updateDatum((d, payload) => d.choiceId === payload.choice_id))
actionManager.add(AT.dk_rf, function (interview, action, questionDatum) {
  if (questionDatum) {
    questionDatum.dkRf = action.payload.dk_rf // True or false
    // Optionally remove dk_rf responses if they deselect dk_rf
    if (shouldRemoveDkRfResponsesOnDeselect && questionDatum.dkRf === null) {
      questionDatum.dkRfVal = null
    }
  }
  // Uncomment this if we want to remove datum associated with this question
  // if (questionDatum.data && questionDatum.data.length) {
  //   interview.deleteAllQuestionDatumData(questionDatum)
  // }
})
actionManager.add(AT.dk_rf_val, function (interview, action: Action, questionDatum) {
  if (questionDatum) {
    questionDatum.dkRfVal = action.payload.dk_rf_val
  } else {
    console.error('dk-rf-val', 'invalid input without a questionDatum', action.payload)
  }
})
actionManager.add(AT.next, async function (interview: InterviewManager, a, b, c?, actionWasInitiatedByHuman?: boolean): Promise<void> {
  await interview.next()
})
actionManager.add(AT.previous, async function (interview: InterviewManager, a, b, c?, actionWasInitiatedByHuman?: boolean): Promise<void> {
  await interview.previous()
})
actionManager.add(AT.number_change, addOrUpdateSingleDatum)
actionManager.add(AT.add_edge, addDatum)
actionManager.add(AT.remove_edge, removeDatum((datum, payload) => datum.edgeId === payload.edge_id))
actionManager.add(AT.add_photo, addDatum)
actionManager.add(AT.remove_photo, removeDatum((datum, payload) => datum.photoId === payload.photo_id))
actionManager.add(AT.add_roster_row, addDatum)
actionManager.add(AT.remove_roster_row, removeDatum((datum, payload) => datum.rosterId === payload.roster_id))
actionManager.add(AT.change_sort_order, function (interview, action: Action, questionDatum: QuestionDatum) {
  // TODO: This is not right. We can't have a datum_id in the payload because the datum_ids can change
  let datum = questionDatum.data.find(datum => datum.id === action.payload.datum_id)
  if (datum) {
    datum.sortOrder = action.payload.sort_order
  } else {
    throw new Error('No datum exists with this id: ' + action.payload.datum_id)
  }
})

actionManager.add(AT.set_val, addOrUpdateSingleDatum)
actionManager.add(AT.remove_geo, removeDatum((datum, payload) => datum.geoId === payload.geo_id))
actionManager.add(AT.add_geo, addDatum)
actionManager.add(AT.respondent_move, addDatum)
actionManager.add(AT.respondent_add_geo, addDatum)
actionManager.add(AT.respondent_remove_geo, addDatum)
actionManager.add(AT.other_respondent_added, function () {
  debugger
  addOrUpdateSingleDatum.apply(null, arguments)
})

// Action aliases
actionManager.add(AT.set_date, addOrUpdateSingleDatum)
actionManager.add(AT.set_text, addOrUpdateSingleDatum)
actionManager.add(AT.set_time, addOrUpdateSingleDatum)
actionManager.add(AT.deselect_no_one, function (interview, action: Action, questionDatum) {
  if (questionDatum) {
    questionDatum.noOne = false
  } else {
    console.error(AT.deselect_no_one, 'invalid input without a questionDatum')
  }
})
actionManager.add(AT.select_no_one, function (interview, action: Action, questionDatum) {
  if (questionDatum) {
    questionDatum.noOne = true
  } else {
    console.error(AT.select_no_one, 'invalid input without a questionDatum')
  }
})

export default actionManager

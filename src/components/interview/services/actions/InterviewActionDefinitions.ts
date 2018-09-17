import parameterTypes from '../../../../static/parameter.types'
import AT from '../../../../static/action.types'
import QT from '../../../../static/question.types'
import QuestionDatum from '../../../../entities/trellis/QuestionDatum'
import actionManager from './ActionManager'
import {addDatum, addDatumLimit, addOrUpdateSingleDatum, removeDatum, updateDatum, ActionPayload} from './DatumOperations'
import Question from '../../../../entities/trellis/Question'
import InterviewManagerOld, {default as InterviewManager} from '../../classes/InterviewManager'

// Options
const shouldRemoveDkRfResponsesOnDeselect = false   // Indicate if dk_rf_val should be removed when dk_rf is set to null. This should likely be a property of the form

// Definitions
/**
 * All action handlers are given access to the interview, the action payload, the questionBlueprint and the questionDatum
 * with the datum associated with the question datum at questionDatum.datum. DatumRecycler should be used whenver new
 * datum are being created so that the ids are recycled
 */
actionManager.add(AT.select_choice, function (interview: InterviewManagerOld, payload: ActionPayload, questionDatum: QuestionDatum, questionBlueprint: Question) {
  let choice = questionBlueprint.choices.map(c => c.choice).find(c => c.id === payload.choice_id)
  let shouldRemoveOthers = questionBlueprint.questionTypeId === QT.multiple_choice
  let paramMap = new Map()

  // Handle any parameters on the choice being selected
  let choiceHasOtherInput = false
  for (let param of questionBlueprint.questionParameters) {
    paramMap.set(param.val, param.parameter)
    if (choice.val === param.val) {
      let pId = parseInt(param.parameterId, 10)
      if (pId === parameterTypes.other) {
        choiceHasOtherInput = true
      }
      if (pId === parameterTypes.exclusive) {
        shouldRemoveOthers = true
      }
    }
  }

  // Remove any other exclusive choices that are currently selected
  let exclusiveParameter = questionBlueprint.questionParameters.find(p => {
    return parseInt(p.parameterId, 10) === parameterTypes.exclusive
  })
  if (exclusiveParameter) {
    let cChoice = questionBlueprint.choices.find(c => c.choice.val === exclusiveParameter.val)
    if (cChoice) {
      for (let i = 0; i < questionDatum.data.length; i++) {
        let datum = questionDatum.data[i]
        if (datum.choiceId === cChoice.id) {
          questionDatum.data.splice(i, 1)
          break
        }
      }
    } else {
      // debugger
    }
  }

  if (shouldRemoveOthers) {
    questionDatum.data = [] // This could break references... shouldn't be a since we're trying to pass around copies
  }
  let datum = addDatum(interview, payload, questionDatum)
  if (choiceHasOtherInput) {
    datum.val = ''
  }
})
actionManager.add(AT.deselect_choice, removeDatum((d, payload) => d.choiceId === payload.choice_id))
actionManager.add(AT.other_choice_text, updateDatum((d, payload) => d.choiceId === payload.choice_id))
actionManager.add(AT.dk_rf, function (interview, payload, questionDatum) {
  if (questionDatum) {
    questionDatum.dkRf = payload.dk_rf // True or false
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
actionManager.add(AT.dk_rf_val, function (interview, payload: ActionPayload, questionDatum) {
  if (questionDatum) {
    questionDatum.dkRfVal = payload.dk_rf_val
  } else {
    console.error('dk-rf-val', 'invalid input without a questionDatum', payload)
  }
})
actionManager.add(AT.next, function (interview: InterviewManager, a, b, c?, actionWasInitiatedByHuman?: boolean): void {
  // if (actionWasInitiatedByHuman) {
  //   interview.nextAndReplay()
  // } else {
  //   interview.next()
  // }
  interview.next()
  // interview.replayTo(interview.location.section, interview.location.page, interview.location.sectionRepetition, interview.location.sectionFollowUpDatumId)
})
actionManager.add(AT.previous, function (interview: InterviewManager, a, b, c?, actionWasInitiatedByHuman?: boolean): void {
  // if (actionWasInitiatedByHuman) {
  //   interview.previousAndReplay()
  // } else {
  //   interview.previous()
  // }
  interview.previous()
  // // interview.replayTo(interview.location.section, interview.location.page, interview.location.sectionRepetition, interview.location.sectionFollowUpDatumId)
})
actionManager.add(AT.number_change, addOrUpdateSingleDatum)
actionManager.add(AT.add_edge, addDatum)
actionManager.add(AT.remove_edge, removeDatum((datum, payload) => datum.edgeId === payload.edge_id))
actionManager.add(AT.add_roster_row, addDatum)
actionManager.add(AT.remove_roster_row, removeDatum((datum, payload) => datum.rosterId === payload.roster_id))
actionManager.add(AT.change_sort_order, function (interview, payload, questionDatum: QuestionDatum) {
  let datum = questionDatum.data.find(datum => datum.id === payload.datum_id)
  if (datum) {
    datum.sortOrder = payload.sort_order
  } else {
    throw new Error('No datum exists with this id: ' + payload.datum_id)
  }
})

actionManager.add(AT.set_val, addOrUpdateSingleDatum)
actionManager.add(AT.remove_geo, removeDatum((datum, payload) => datum.geoId === payload.geo_id))
actionManager.add(AT.add_geo, addDatum)
actionManager.add(AT.respondent_move, addDatumLimit(1))
actionManager.add(AT.respondent_add_geo, addDatumLimit(1))
actionManager.add(AT.respondent_remove_geo, addDatumLimit(1))
actionManager.add(AT.other_respondent_added, function () {
  debugger
  addOrUpdateSingleDatum.apply(null, arguments)
})

// Action aliases
actionManager.add(AT.set_date, addOrUpdateSingleDatum)
actionManager.add(AT.set_text, addOrUpdateSingleDatum)
actionManager.add(AT.set_time, addOrUpdateSingleDatum)

export default actionManager

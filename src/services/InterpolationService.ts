import {default as InterviewManager, sharedInterviewInstance} from '../components/interview/classes/InterviewManager'
import EdgeService from './edge/EdgeService'
import RosterService from './roster/RosterService'
import StringInterpolationService from './StringInterpolationService'
import {InterviewLocation} from "../components/interview/services/InterviewAlligator";
import TranslationText from "../entities/trellis/TranslationText";

export default class InterpolationService {
  /**
   * Returns a translation with interpolated fills based on the current interview (if any) and location in
   * the interview.
   * @param {TranslationText[]} translationText
   * @param {Object} location
   * @returns {Translation}
   */
  static async getInterpolatedTranslationText (translationText: TranslationText[], location: InterviewLocation) {
    for (const t of translationText) {
      let varNames = StringInterpolationService.getInterpolationKeys(t.translatedText)
      for (const varName of varNames) {
        let fill = await InterpolationService.getFillByVarName(varName, sharedInterviewInstance, location)
        t.translatedText = t.translatedText.replace(`[${varName}]`, fill)
      }
    }
    return translationText
  }

  static async getFillByVarName (varName: string, interviewManager: InterviewManager, location: InterviewLocation) {
    try {
      let questionDatum = interviewManager.getSingleDatumByQuestionVarName(varName, location.sectionFollowUpRepetition)
      let question = interviewManager.questionIndex.get(questionDatum.questionId)
      let followUpDatum
      if (location.sectionFollowUpDatumId) {
        followUpDatum = questionDatum.data.find(d => d.id === location.sectionFollowUpDatumId)
      }
      let datum = questionDatum.data.find(d => d.eventOrder === location.sectionFollowUpRepetition)
      switch (question.questionType.name) {
        case 'relationship':
          let edgeId = (followUpDatum) ? followUpDatum.edgeId : datum.edgeId
          const edges = await EdgeService.getEdges([edgeId])
          return edges[0].targetRespondent.name
        case 'roster':
          let rosterId = (followUpDatum) ? followUpDatum.rosterId : datum.rosterId
          const roster = await RosterService.getRosterRows([rosterId])
          return roster[0].val
        default:
          return datum.val
      }
    } catch (err) {
      let fill = interviewManager.getRespondentFillByVarName(varName)
      if (fill) {
        return fill
      } else {
        // TODO: translate
        return 'NO FILL FOUND'
      }
    }
  }
}

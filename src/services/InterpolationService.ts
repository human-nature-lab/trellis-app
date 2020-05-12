import {default as InterviewManager, sharedInterviewInstance} from '../components/interview/classes/InterviewManager'
import EdgeService from './edge/EdgeService'
import RosterService from './roster/RosterService'
import StringInterpolationService from './StringInterpolationService'
import { InterviewLocation } from '../components/interview/services/InterviewAlligator'
import TranslationText from '../entities/trellis/TranslationText'
import QT from '../static/question.types'
import Datum from '../entities/trellis/Datum'
import Question from '../entities/trellis/Question'
import TranslationService from './TranslationService'
import singleton from '../static/singleton'
import QuestionDatum from '../entities/trellis/QuestionDatum'
import GeoService from './geo/GeoService'
import Geo from '../entities/trellis/Geo'
import RespondentService from './respondent/RespondentService'

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

  /**
   * Grab all of the relevant data for any question type in parallel. All values are formatted as strings.
   * @param {Datum[]} data
   * @param {Question} question
   * @returns {Promise<string[]>}
   */
  static getInterpolatedData (data: Datum[], question: Question): Promise<string[]> {
    const promises = []
    for (let datum of data) {
      switch (question.questionType.id) {
        case QT.relationship:
          promises.push(EdgeService.getEdges([datum.edgeId]).then(edges => edges[0].targetRespondent.name))
          break
        case QT.roster:
          promises.push(RosterService.getRosterRows([datum.rosterId]).then(rows => rows[0].val))
          break
        case QT.geo:
          promises.push(GeoService.getGeoById(datum.geoId).then((geo: Geo) => {
            console.log('geo', geo)
            const r = TranslationService.getAny(geo.nameTranslation, singleton.locale)
            return r
          }))
          break
        case QT.multiple_select:
        case QT.multiple_choice:
          const qc = question.choices.find(qc => qc.choiceId === datum.choiceId)
          if (qc) {
            const choice = qc.choice
            promises.push(new Promise(resolve => {
              resolve(TranslationService.getAny(choice.choiceTranslation, singleton.locale))
            }))
          }
          break
        default:
          promises.push(new Promise(resolve => resolve(datum.val)))
          break
      }
    }
    return Promise.all(promises)
  }

  /**
   * Get a fill value using the varName of a question and the current location within the interview
   * @param {string} varName
   * @param {InterviewManager} interviewManager
   * @param {InterviewLocation} location
   * @returns {Promise<any>}
   */
  static async getFillByVarName (varName: string, interviewManager: InterviewManager, location: InterviewLocation) {
    try {
      let questionDatum: QuestionDatum = interviewManager.getSingleDatumByQuestionVarName(varName, location.sectionFollowUpDatumId)
      let question: Question = interviewManager.questionIndex.get(questionDatum.questionId)
      let vals: string[]
      if (location.sectionFollowUpDatumId) {
        // Find the specific datum for this follow up repetition
        let datum = questionDatum.data.find(d => d.id === location.sectionFollowUpDatumId)
        vals = await InterpolationService.getInterpolatedData([datum], question)
      } else {
        vals = await InterpolationService.getInterpolatedData(questionDatum.data, question)
      }
      return vals.join(', ')
    } catch (err) {
      let fill = interviewManager.getRespondentFillByVarName(varName)
      if (fill) {
        return fill
      } else {
        // TODO: translate error message
        return 'NO FILL FOUND'
      }
    }
  }
}

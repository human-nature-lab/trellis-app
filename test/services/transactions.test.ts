import InterviewService from '../../src/services/interview/InterviewService'
import RosterService from '../../src/services/roster/RosterService'
import SurveyService from "../../src/services/survey";
import {forms, respondentId2, studyId} from "../testing-ids";
import InterviewDeltaInterface, {
  AddedRemovedDelta,
  ConditionTagDelta,
  DataDelta, ModifiedDelta
} from "../../src/services/interview/InterviewDeltaInterface";
import Datum from "../../src/entities/trellis/Datum";
import QuestionDatum from "../../src/entities/trellis/QuestionDatum";
import {expect} from 'chai'
import FormService from "../../src/services/form/FormService";
import uuid from 'uuid/v4'

export default function () {
  describe('Transactions', function (this: any) {
    this.timeout(20 * 1000)
    it('should not throw an error when multiple transactions occur at the same time', async () => {
      // An error seems to be thrown when the data saving method is called while another insert/transaction is happening
      console.log('survey create args', studyId, respondentId2, forms.lastPageSkipped)
      const survey = await SurveyService.create(studyId, respondentId2, forms.lastPageSkipped)
      const interview = await InterviewService.create(survey.id)
      const form = await FormService.getForm(forms.lastPageSkipped)
      const fakeDiff: InterviewDeltaInterface = new InterviewDeltaInterface(
        new DataDelta(new ModifiedDelta([], [], []), new ModifiedDelta([(new QuestionDatum()).fromSnakeJSON({
          id: uuid(),
          question_id: 'afac2d97-5583-4e8b-b233-4e82d0abf729',
          survey_id: survey.id,
          section_repetition: 0,
          follow_up_datum_id: null
        })], [], [])),
        new ConditionTagDelta(new AddedRemovedDelta([], []), new AddedRemovedDelta([], []), new AddedRemovedDelta([], []))
      )

      // Don't await so they are called in parallel will overlap
      return new Promise((resolve, reject) => {
        let completed = 0
        function checkDone () {
          completed++
          if (completed >= 2) {
            resolve()
          }
        }
        setTimeout(() => {
          RosterService.createRosterRows(['random 1', 'random 2']).catch(err => {
             throw err
          }).then(checkDone)
        })
        setTimeout(() => {
          InterviewService.saveData(interview.id, fakeDiff).catch(err => {
             throw err
          }).then(checkDone)
        })
      })

    })
  })
}

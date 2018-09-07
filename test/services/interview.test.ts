import './mocha.globals'
import {expect} from 'chai'

import InterviewServiceWeb from '../../src/services/interview/InterviewServiceWeb'
import InterviewServiceCordova from '../../src/services/interview/InterviewServiceCordova'
import Interview from '../../src/entities/trellis/Interview'
import User from '../../src/entities/trellis/User'
import Survey from '../../src/entities/trellis/Survey'
import Respondent from '../../src/entities/trellis/Respondent'
import Action from '../../src/entities/trellis/Action'

const interviewId: string = '8d032e56-25a5-4f85-8a88-f015d059ff08'

export default function () {
  describe('Interview service', function (this: any) {
    this.timeout(60 * 1000)
    let services = [new InterviewServiceWeb(), new InterviewServiceCordova()]
    describe('API', () => {
      for (let service of services) {
        it(`${service.constructor.name}.getInterview: should return an interview`, async () => {
          let interview = await service.getInterview(interviewId)
          expect(interview).to.be.an.instanceOf(Interview, `Service didn't return an instance of Interview`)
          expect(interview.survey).to.be.an.instanceOf(Survey, `Interview doesn't have survey defined`)
          expect(interview.user).to.be.an.instanceOf(User, `Interview doesn't have user defined`)
          expect(interview.survey.respondent).to.be.an.instanceOf(Respondent, `Survey doesn't have respondent defined`)
        })
        it(`${service.constructor.name}.getActions: should return an array of actions`, async () => {
          let actions: Action[] = await service.getActions(interviewId)
          expect(actions).to.be.a('array')
          expect(actions.length).to.be.greaterThan(0)
          expect(actions[0]).to.be.instanceOf(Action, `Didn't return instances of Action`)
        })
        it(`${service.constructor.name}.saveActions: should save actions to the database`)
        it(`${service.constructor.name}.getData: should match the InterviewDataInterface`)
        it(`${service.constructor.name}.saveData: should save things in the InterviewDeltaInterface`)
        it(`${service.constructor.name}.getPreload: should do something???`)
        it(`${service.constructor.name}.complete: should mark an interview as completed`)
        it(`${service.constructor.name}.create: should create a new interview for this survey`)
      }
    })
    describe('COMPARE', () => {
      it(`.getInterview: Should have the same interview instance`, () => {
        return Promise.all(services.map(s => s.getInterview(interviewId))).then(res => {
          for (let interview of res) {
            expect(interview).to.not.be.undefined
          }
          expect(res[0].id).to.equal(res[1].id, `ids didn't match`)
          expect(res[0].userId).to.equal(res[1].userId, `userIds didn't match`)
        })
      })
      it('.getActions: Should get the same array of actions', () => {
        return Promise.all(services.map(s => s.getActions(interviewId))).then(res => {
          for (let actions of res) {
            expect(actions.length).to.be.greaterThan(0)
          }
          let webActions = res[0].map(a => JSON.parse(JSON.stringify(a)))
          let corActions = res[1].map(a => JSON.parse(JSON.stringify(a)))
          webActions.sort((a, b) => a.id.localeCompare(b.id))
          corActions.sort((a, b) => a.id.localeCompare(b.id))
          expect(webActions).to.deep.equal(corActions, 'all actions were are not the same')
        })
      })
      it('.getData: should get the same InterviewDataInterface')
      it('.getPreload: should get the same preload data')
    })
  })
}

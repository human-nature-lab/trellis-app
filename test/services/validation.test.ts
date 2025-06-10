import { expect } from 'chai'
import { ValidationRules } from '../../src/classes/Validators'
import { validateParametersNew } from '../../src/components/interview/services/ValidatorService'
import Question from '../../src/entities/trellis/Question'
import QuestionDatum from '../../src/entities/trellis/QuestionDatum'
import QT from '../../src/static/question.types'
import PT from '../../src/static/parameter.types'
import { v4 as uuidv4 } from 'uuid'
export default function () {

  function makeQuestion(questionType: string, questionParameters: [string | number, any][], values: (string | number)[], dkRf: boolean = null, dkRfVal?: string): Question {
    const id = uuidv4()
    const q = new Question().fromSnakeJSON({
      id,
      question_type_id: questionType,
      question_parameters: questionParameters.map(v => ({
        parameter_id: v[0],
        val: v[1]
      }))
    })
    q.datum = new QuestionDatum().fromSnakeJSON({
      question_id: id,
      data: values.map(v => ({
        val: v
      })),
      dk_rf: dkRf,
      dk_rf_val: dkRfVal
    })
    return q
  }

  describe('Validation behavior', function () {
    describe('Rules test', function () {
      it('should handle min correctly', function () {
        for (const type of [QT.decimal, QT.integer]) {
          for (let v of [1, 1.5, 10, 20, 100, 1000, 10000]) {
            const q = makeQuestion(type, [[PT.min, 1]], [v])
            expect(validateParametersNew(q, q.questionParameters, q.datum), 'Min of 1 should allow values greater than or equal to 1').to.be.true
          }
          for (let v of [-1000, -200, 0, 0.5]) {
            const q = makeQuestion(type, [[PT.min, 1]], [v])
            const res = validateParametersNew(q, q.questionParameters, q.datum)
            expect(res, 'Min of 1 should not allow negative values').to.not.be.true
          }
        }
      })
      it('should handle max correctly', function () {
        for (const type of [QT.decimal, QT.integer]) {
          for (let v of [10.2, 11, 20, 100, 1000, 10000]) {
            const q = makeQuestion(type, [[PT.max, 10]], [v])
            const res = validateParametersNew(q, q.questionParameters, q.datum)
            expect(res, 'max should be false if value is > 10').to.not.be.true
          }
          for (let v of [-1000, -200, 0, 1, 9, 9.5, 10]) {
            const q = makeQuestion(type, [[PT.max, 10]], [v])
            // if (v === 0) debugger
            const res = validateParametersNew(q, q.questionParameters, q.datum)
            expect(res, 'max should be true if value is <= 10').to.be.true
          }
        }
      })
      it('should handle max length types correctly', function () {
        for (const t of [[PT.max_geos, QT.geo], [PT.max_relationships, QT.relationship], [PT.max_roster, QT.roster]]) {
          for (const n of [1, 10, 50]) {
            const q = makeQuestion(t[1] as string, [[t[0], n]], Array(n).fill(0).map(i => n - 10))
            const res = validateParametersNew(q, q.questionParameters, q.datum)
            expect(res, 'max length should be true if value is <= ' + n).to.be.true
          }
          // Test 0 with is_required=true
          const q = makeQuestion(t[1] as string, [[t[0], 10], [PT.is_required, false]], [])
          const res = validateParametersNew(q, q.questionParameters, q.datum)
          expect(res, 'parameters should be valid if is_required=false with 0 responses').to.be.true
        }
      })
      it('should handle min length types correctly', function () {
        for (const t of [[PT.min_geos, QT.geo], [PT.min_relationships, QT.relationship], [PT.min_roster, QT.roster]]) {
          for (const n of [1, 10, 50]) {
            for (const i of [0, 1, 5, 10, 22]) {
              const q = makeQuestion(t[1] as string, [[t[0], n]], Array(n + i).fill(0).map(i => n - 10))
              const res = validateParametersNew(q, q.questionParameters, q.datum)
              expect(res, 'min length should be true if value is >= ' + n).to.be.true
            }
          }
          // Test 0 with is_required=true
          const q = makeQuestion(t[1] as string, [[t[0], 0], [PT.is_required, false]], [])
          const res = validateParametersNew(q, q.questionParameters, q.datum)
          expect(res, 'parameters should be valid if is_required=false with 0 responses').to.be.true
        }
      })
      it('should handle email validation correctly', function () {
        const validEmails = ['onetwothree@gmail.com', '0987@nonprofit.org', '12345-asdf@inter.net', 'asdf+asdf+asdf@m.co']
        for (const val of validEmails) {
          expect(ValidationRules.email(val)).to.be.true
        }
      })
      it('should handle required correctly', function () {
        let q = makeQuestion(QT.multiple_choice, [[PT.is_required, false]], [])
        expect(validateParametersNew(q, q.questionParameters, q.datum)).to.be.true
        q = makeQuestion(QT.multiple_choice, [], [])
        expect(validateParametersNew(q, q.questionParameters, q.datum)).to.not.be.true
      })
      it('should have read_only override other parameters', function () {
        let q = makeQuestion(QT.multiple_select, [[PT.read_only, true], [PT.is_required, true]], [])
        expect(validateParametersNew(q, q.questionParameters, q.datum)).to.be.true
        q = makeQuestion(QT.geo, [[PT.read_only, true], [PT.is_required, false], [PT.min_geos, 10]], [])
        expect(validateParametersNew(q, q.questionParameters, q.datum)).to.be.true
      })
      it(`should have Don't know and Refused responses override other parameters`, function () {
        // Test DK w/ val
        let q = makeQuestion(QT.multiple_select, [[PT.is_required, true]], [], true, 'dk')
        expect(validateParametersNew(q, q.questionParameters, q.datum), 'DK with a reason should always be valid').to.be.true
        // Test RF w/ val
        q = makeQuestion(QT.relationship, [], [], false, 'rf')
        expect(validateParametersNew(q, q.questionParameters, q.datum), 'RF with a reason should always be valid').to.be.true
        // Test DK and RF w/out val
        q = makeQuestion(QT.year_month_day, [], [], true)
        expect(validateParametersNew(q, q.questionParameters, q.datum), 'DK requires a value to be present').to.not.be.true
        q = makeQuestion(QT.year_month_day, [], [], false)
        expect(validateParametersNew(q, q.questionParameters, q.datum), 'RF requires a value to be present').to.not.be.true
      })
    })
  })
}

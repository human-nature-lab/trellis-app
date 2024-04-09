import DiffService from '../../src/services/DiffService'
import uuid from 'uuid/v4'
import { now } from '../../src/services/DateService'
import { add } from 'date-fns'
import { expect } from 'chai'
import QuestionDatum from '../../src/entities/trellis/QuestionDatum'
import Datum from '../../src/entities/trellis/Datum'

export default function () {
  describe('DiffService.spec', () => {
    function copy (arr) {
      return JSON.parse(JSON.stringify(arr))
    }
    describe('data diff', () => {
      const baseQDatum = new QuestionDatum().fromSnakeJSON({
        id: uuid(),
        answered_at: now(),
        dk_rf_val: null,
        dk_rf: null,
        updated_at: now(),
        deleted_at: now(),
        created_at: now(),
        data: [],
      })
      const baseDatum = new Datum().fromSnakeJSON({
        id: uuid(),
        val: 'wowowowow',
        choic_id: 'asdfasdf',
        edge_id: 'asdfff',
        geo_id: 'about that',
        roster_id: 'okiday',
      })
      const oldQDatum: QuestionDatum[] = copy([baseQDatum, baseQDatum, baseQDatum]).map(qDatum => {
        qDatum.id = uuid()
        qDatum.data = copy([baseDatum, baseDatum, baseDatum]).map(datum => {
          datum.id = uuid()
          return datum
        })
        return qDatum
      })
      let newQDatum: QuestionDatum[]
      beforeEach(() => {
        newQDatum = copy(oldQDatum)
      })
      it('should handle added question_datum', () => {
        newQDatum = newQDatum.concat(copy(oldQDatum).map(qDatum => {
          qDatum.id = uuid()
          return qDatum
        }))
        const diff = DiffService.dataDiff(newQDatum, oldQDatum)
        expect(diff).to.have.keys('questionDatum', 'datum')
        expect(diff.questionDatum).to.have.keys('added', 'removed', 'modified')
        expect(diff.datum).to.have.keys('added', 'removed', 'modified')
        expect(diff.questionDatum.added).to.have.lengthOf(3)
        expect(diff.questionDatum.removed, 'removed should be empty').to.be.an('array').that.is.empty
        expect(diff.questionDatum.modified, 'modified should be empty').to.be.an('array').that.is.empty
        expect(diff.questionDatum.added).to.deep.include(newQDatum[3], 'should have the first added question datum')
          .and.deep.include(newQDatum[4], 'should have the second additional question datum')
          .and.deep.include(newQDatum[5], 'should have the third additional question datum')
      })
      it('should handle removed question_datum', () => {
        const removedQDatum = []
        newQDatum = newQDatum.filter((q, i) => {
          if (i !== 1) {
            removedQDatum.push(q)
          }
          return i === 1
        })
        const diff = DiffService.dataDiff(newQDatum, oldQDatum)
        const removedDatum = []
        for (const removed of removedQDatum) {
          removedDatum.push(...removed.data)
          expect(diff.questionDatum.removed).to.deep.include(removed, 'should have all removed question datum preset')
        }
        for (const removed of removedDatum) {
          expect(diff.datum.removed).to.deep.include(removed, 'should have all removed datum preset')
        }
      })
      it('should handle modified question_datum values as well as added and removed keys', () => {
        newQDatum[1].dkRf = true
        newQDatum[1].dkRfVal = 'There are many things I don\'t know'
        newQDatum[2].a_wild_property_appeared = 'It\'s a dragon!'
        let diff = DiffService.dataDiff(newQDatum, oldQDatum)
        expect(diff.questionDatum.removed).to.be.an('array').that.is.empty
        expect(diff.questionDatum.added).to.be.an('array').that.is.empty
        expect(diff.questionDatum.modified).to.have.lengthOf(2)
        expect(diff.questionDatum.modified).to.deep.include(newQDatum[1], 'should include all modified question datum values')
        expect(diff.questionDatum.modified).to.deep.include(newQDatum[2], 'should include all added keys')

        newQDatum[1].dkRf = null
        diff = DiffService.dataDiff(newQDatum, oldQDatum)
        expect(diff.questionDatum.removed).to.be.an('array').that.is.empty
        expect(diff.questionDatum.added).to.be.an('array').that.is.empty
        expect(diff.questionDatum.modified).to.deep.include(newQDatum[1], 'should include all modified question datum values')
          .and.deep.include(newQDatum[2], 'should include all added keys')
      })
      it('should handle modified datum values as well as added and removed keys', () => {
        newQDatum[0].data[1].updatedAt = new Date(now().getTime() + 100000)
        newQDatum[1].data[0].a_wild_property_appeared = null
        const changeDatum = newQDatum[2].data[2]
        changeDatum.geoId = null
        newQDatum[2].data[2] = changeDatum
        const diff = DiffService.dataDiff(newQDatum, oldQDatum)
        expect(diff.datum.modified).to.deep.include(newQDatum[0].data[1], 'should include modified properties on datum')
          .and.deep.include(newQDatum[1].data[0], 'should include added properties as modifications')
          .and.deep.include(newQDatum[2].data[2], 'should include deleted properties as modifications')
      })
      it('should handle added datum', () => {
        const newDatum = copy(newQDatum[0].data[0])
        newDatum.id = uuid()
        newQDatum[0].data.push(newDatum)
        const diff = DiffService.dataDiff(newQDatum, oldQDatum)
        expect(diff.datum.added).to.deep.include(newDatum, 'datum.added array should include an added datum if it has a new id')
      })
      it('should handle removed datum', () => {
        const removed = newQDatum[1].data.splice(0, 1)[0]
        const diff = DiffService.dataDiff(newQDatum, oldQDatum)
        expect(diff.datum.removed).to.deep.include(removed, 'datum.removed array should include a removed datum')
      })
    })
  })
}

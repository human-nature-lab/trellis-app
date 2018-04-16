import DiffService from '@/components/interview/services/DiffService'
import uuid from 'uuid/v4'
describe('DiffService.spec', () => {
  function copy (arr) {
    return JSON.parse(JSON.stringify(arr))
  }
  describe('data diff', () => {
    let baseQDatum = {
      id: uuid(),
      dk_rf: null,
      dk_rf_val: null,
      answered_at: (new Date()).getTime(),
      updated_at: (new Date()).getTime(),
      deleted_at: (new Date()).getTime(),
      datum: []
    }
    let baseDatum = {
      id: uuid(),
      val: 'wowowowow',
      choice_id: 'asdfasdf',
      edge_id: 'asdfff',
      geo_id: 'about that',
      roster_id: 'okiday'
    }
    let oldQDatum = copy([baseQDatum, baseQDatum, baseQDatum]).map(qDatum => {
      qDatum.id = uuid()
      qDatum.datum = copy([baseDatum, baseDatum, baseDatum]).map(datum => {
        datum.id = uuid()
        return datum
      })
      return qDatum
    })
    it('should handle added question_datum', () => {
      let newQDatum = copy(oldQDatum)
      newQDatum = newQDatum.concat(copy(oldQDatum).map(qDatum => {
        qDatum.id = uuid()
        return qDatum
      }))
      let diff = DiffService.dataDiff(newQDatum, oldQDatum)
      expect(diff).to.have.keys('questionDatum', 'datum')
      expect(diff.questionDatum).to.have.keys('added', 'removed', 'modified')
      expect(diff.datum).to.have.keys('added', 'removed', 'modified')
      expect(diff.questionDatum.added).to.have.lengthOf(3)
      expect(diff.questionDatum.removed, 'removed should be empty').to.be.an('array').that.is.empty
      expect(diff.questionDatum.modified, 'modified should be empty').to.be.an('array').that.is.empty
      delete newQDatum[3].datum
      delete newQDatum[4].datum
      delete newQDatum[5].datum
      expect(diff.questionDatum.added).to.deep.include(newQDatum[3], 'should have the first added question datum')
        .and.deep.include(newQDatum[4], 'should have the second additional question datum')
        .and.deep.include(newQDatum[5], 'should have the third additional question datum')
    })
    it('should handle removed question_datum', () => {
      let newQDatum = copy(oldQDatum)
      let removedQDatum = []
      newQDatum = newQDatum.filter((q, i) => {
        if (i !== 1) {
          removedQDatum.push(q)
        }
        return i === 1
      })
      let diff = DiffService.dataDiff(newQDatum, oldQDatum)
      let removedDatum = []
      for (let removed of removedQDatum) {
        removedDatum.push(...removed.datum)
        delete removed.datum
        expect(diff.questionDatum.removed).to.deep.include(removed, 'should have all removed question datum preset')
      }
      for (let removed of removedDatum) {
        expect(diff.datum.removed).to.deep.include(removed, 'should have all removed datum preset')
      }
    })
    it('should handle modified question_datum values as well as added and removed keys', () => {
      let newQDatum = copy(oldQDatum)
      newQDatum[1].dk_rf = true
      newQDatum[1].dk_rf_val = `There are many things I don't know`
      newQDatum[2].a_wild_property_appeared = `It's a dragon!`
      let diff = DiffService.dataDiff(newQDatum, oldQDatum)
      delete newQDatum[1].datum
      delete newQDatum[2].datum
      expect(diff.questionDatum.modified).to.deep.include(newQDatum[1], 'should include all modified question datum values')
        .and.deep.include(newQDatum[2], 'should include all added keys')
    })
    it('should handle modified datum values as well as added and removed keys', () => {
      let newQDatum = copy(oldQDatum)
      newQDatum[0].datum[1].updated_at = 1000
      newQDatum[1].datum[0].a_wild_property_appeared = null
      let {geo_id, ...removedProp} = newQDatum[2].datum[2] // eslint-disable-line
      newQDatum[2].datum[2] = removedProp
      let diff = DiffService.dataDiff(newQDatum, oldQDatum)
      expect(diff.datum.modified).to.deep.include(newQDatum[0].datum[1], 'should include modified properties on datum')
        .and.deep.include(newQDatum[1].datum[0], 'should include added properties as modifications')
        .and.deep.include(newQDatum[2].datum[2], 'should include deleted properties as modifications')
    })
  })
  describe('condition diff', () => {

  })
})

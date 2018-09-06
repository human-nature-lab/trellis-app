import './mocha.globals'
import {expect} from 'chai'
import FormServiceCordova from '../../src/services/form/FormServiceCordova'
import FormServiceWeb from '../../src/services/form/FormServiceWeb'

let cordovaService = new FormServiceCordova()
let webService = new FormServiceWeb()

const testFormId = '0497e6a5-53de-48d8-acef-e45a5d22b18e'
const studyId = '3c01a601-609c-42d6-bfe6-00de2964025c'

export default function () {
  describe('Form service', () => {
    describe('API', () => {
      let services = [cordovaService, webService]
      it('should return a list of forms', function () {
        return Promise.all(services.map(s => s.getStudyForms(studyId).then(forms => {
          expect(forms.length).to.be.greaterThan(0, s.constructor.name + ': No forms were returned for this study')
        })))
      })
      it('should return a form', async function () {
        for (let service of services) {
          let form = await service.getForm(testFormId)
          expect(form).to.not.equal(undefined, service.constructor.name + ': This form was undefined')
          expect(form).to.have.all.keys([
            'id',
            'formMasterId',
            'nameTranslationId',
            'version',
            'isPublished',
            'sections',
            'skips',
            'nameTranslation'
          ], service.constructor.name + ': Does not have all keys')
        }
      })
    })
    describe('Results', () => {
      it('getForm: should return identical versions of the form', async () => {
        let cForm = await cordovaService.getForm(testFormId)
        let wForm = await webService.getForm(testFormId)
        // @ts-ignore
        [cForm, wForm].forEach(form => {
          expect(form).to.not.be.undefined
        })
        expect(cForm).to.deep.equal(wForm, 'The forms are not the same')
      })
      it('geStudyForms: should return the same forms', async () => {
        let cForms = await cordovaService.getStudyForms(studyId)
        let wForms = await webService.getStudyForms(studyId)
        // @ts-ignore
        [cForms, wForms].forEach(forms => {
          expect(forms.length).to.be.greaterThan(0, 'No forms were returned for this study')
        })
        expect(cForms.length).to.equal(wForms.length, `The same number of forms weren't returned for both`)
        expect(cForms).to.deep.include(wForms, `The forms weren't all the same`)
      })
    })
  })
}

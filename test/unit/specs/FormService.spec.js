import FormService from '@/services/form/FormService'

describe(`FormService`, () => {
  it('service should be defined', () => {
    expect(FormService).to.not.be.null('This service has not been defined yet')
  })
  it('should return a correctly structured form', () => {
    return FormService.getStudyForms()
      .then(function (res) {
        expect(res).to.be.an('object')
        expect(res).to.have.property('sections')
        expect(res).to.have.property('id')
        expect(res).to.have.property('version')
        expect(res).to.have.property('is_published')
        expect(res.is_published).to.be.a('boolean')
        expect(res.sections).to.be.an('array')
        expect(res.sections.length).to.be.greaterThan(0)
      })
  })
})


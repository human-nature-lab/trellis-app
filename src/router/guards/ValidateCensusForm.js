import FormService from '../../services/form/FormService'
import router from '../index'

export default function ValidateCensusForm (to, from, next) {
  if (to.params.censusTypeId) {
    FormService.getCensusForm(to.params.studyId, to.params.censusTypeId).then(form => {
      next()
      if (!form) {
        setTimeout(() => {
          router.go(-1)
        })
      }
    })
  }
}

import { Route } from 'vue-router'
import CensusFormService from '../../services/census/index'
import router from '../index'
import { GuardConfig } from '../GuardQueue'

export function ValidateCensusForm (to, from, next) {
  if (to.params.censusTypeId) {
    CensusFormService.getCensusForm(to.params.studyId, to.params.censusTypeId).then(form => {
      next()
      if (!form) {
        setTimeout(() => {
          router.go(-1)
        })
      }
    })
  }
}

export default {
  name: 'CensusFormGuard',
  async condition (to: Route) {
    const form = await CensusFormService.getCensusForm(to.params.studyId, to.params.censusTypeId)
    return !!form
  }
} as GuardConfig

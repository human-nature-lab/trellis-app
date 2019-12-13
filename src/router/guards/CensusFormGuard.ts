import { Route } from 'vue-router'
import CensusFormService from '../../services/census/index'
import { GuardConfig } from '../GuardQueue'

export default {
  name: 'CensusFormGuard',
  async condition (to: Route) {
    const form = await CensusFormService.getCensusForm(to.params.studyId, to.params.censusTypeId)
    return !!form
  }
} as GuardConfig

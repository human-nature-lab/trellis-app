import { Route } from 'vue-router'
import SingletonService from '../../services/SingletonService'
import StudyService from '../../services/study'
import StorageService from '../../services/StorageService'
import { GuardConfig } from '../GuardQueue'

export default {
  name: 'StudyGuard',
  async condition (to: Route) {
    const studyId = StorageService.get('current-study')
    if (!studyId) {
      return false
    }
    try {
      const study = await StudyService.getStudy(studyId)
      if (study) {
        SingletonService.setCurrentStudy(study)
      }
      return !!study
    } catch (err) {
      StorageService.delete('current-study')
    }
    try {
      const study = to.params.studyId
        ? await StudyService.getStudy(to.params.studyId)
        : await StudyService.getCurrentStudy()
      if (study) {
        SingletonService.setCurrentStudy(study)
      }
      return !!study
    } catch (err) {
      return false
    }
  },
  redirect () {
    return { name: 'StudySelector' }
  },
} as GuardConfig

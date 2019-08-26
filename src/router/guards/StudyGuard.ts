import { Route } from 'vue-router'
<<<<<<< HEAD
import SingletonService from '../../services/SingletonService'
=======
>>>>>>> master
import StudyService from '../../services/study/StudyService'
import StorageService from '../../services/StorageService'
import { GuardConfig } from './GuardQueue'

// export default async function (to, from, next) {
//   // If the user has previously selected a study, load the study into memory
//   let studyId = StorageService.get('current-study')
//   if (studyId) {
//     try {
//       let study = await StudyService.getStudy(studyId)
//       SingletonService.setCurrentStudy(study)
//     } catch (err) {
//       // The ID is no longer valid
//       StorageService.delete('current-study')
//     }
//   }
//   let study
//   if (to.params.studyId) {
//     study = await StudyService.getStudy(to.params.studyId)
//   } else {
//     study = await StudyService.getCurrentStudy()
//   }
//   try {
//     if (study) {
//       StudyService.setCurrentStudy(study)
//       next()
//     } else {
//       next({name: 'StudySelector', query: {to: to.fullPath}})
//     }
//   } catch (err) {
//     console.error(err)
//     return next()
//   }
// }

export default {
  async condition (to: Route) {
    let studyId = StorageService.get('current-study')
    if (!studyId) {
      return false
    }
    try {
      let study = await StudyService.getStudy(studyId)
      if (study) {
        SingletonService.setCurrentStudy(study)
      }
      return !!study
    } catch (err) {
      StorageService.delete('current-study')
    }
    try {
      let study = to.params.studyId ? await StudyService.getStudy(to.params.studyId) : await StudyService.getCurrentStudy()
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
  }
} as GuardConfig

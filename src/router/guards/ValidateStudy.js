import StudyService from '../../services/study/StudyService'
import SingletonService from '../../services/SingletonService'
import StorageService from '../../services/StorageService'

export default async function (to, from, next) {
  // If the user has previously selected a study, load the study into memory
  let studyId = StorageService.get('current-study')
  if (studyId) {
    try {
      let study = await StudyService.getStudy(studyId)
      SingletonService.setCurrentStudy(study)
    } catch (err) {
      // The ID is no longer valid
      StorageService.delete('current-study')
    }
  }
  let study
  if (to.params.studyId) {
    study = await StudyService.getStudy(to.params.studyId)
  } else {
    study = await StudyService.getCurrentStudy()
  }
  try {
    if (study) {
      StudyService.setCurrentStudy(study)
      next()
    } else {
      next({name: 'StudySelector', query: {to: to.fullPath}})
    }
  } catch (err) {
    console.error(err)
    return next()
  }
}

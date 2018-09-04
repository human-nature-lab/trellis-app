import StudyService from '../../services/study/StudyService'
import SingletonService from '../../services/SingletonService'

export default async function (to, from, next) {
  await SingletonService.hasLoaded()
  let study
  if (to.params.studyId) {
    study = await StudyService.getStudy(to.params.studyId)
  } else {
    study = await StudyService.getCurrentStudy()
  }
  try {
    if (study) {
      StudyService.setCurrentStudy(study)
      console.log('study valid')
      next()
    } else {
      next({name: 'StudySelector', query: {to: to.fullPath}})
    }
  } catch (err) {
    console.error(err)
    return next()
  }
}

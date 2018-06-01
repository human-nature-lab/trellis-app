import StudyService from '../../services/study/StudyService'

export default function (to, from, next) {
  let p
  if (to.params.studyId) {
    p = StudyService.getStudy(to.params.studyId)
  } else {
    p = StudyService.getCurrentStudy()
  }
  p.then(study => {
    if (study) {
      StudyService.setCurrentStudy(study)
      console.log('study valid')
      next()
    } else {
      next({name: 'StudySelector'})
    }
  }).catch(err => {
    console.error(err)
    return next({name: 'home'})
  })
}

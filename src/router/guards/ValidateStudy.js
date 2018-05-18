import StudyService from '../../services/study/StudyService'

export default function (to, from, next) {
  console.log('validating study')
  StudyService.getStudy(to.params.studyId).then(study => {
    if (study) {
      StudyService.setCurrentStudy(study)
      console.log('study valid')
      next()
    } else {
      return next({path: '/'})
    }
  })
}

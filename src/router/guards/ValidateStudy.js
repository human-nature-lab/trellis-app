import StudyService from '../../services/study/StudyService'

export default function (to, from, next) {
  StudyService.getStudy(to.params.studyId).then(study => {
    if (study) {
      StudyService.setCurrentStudy(study)
      next()
    } else {
      return next({path: '/'})
    }
  })
}

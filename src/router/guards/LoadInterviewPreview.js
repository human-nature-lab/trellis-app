import singleton from '../../static/singleton'
import FormService from '../../services/form/FormService'
import LocaleService from '../../services/locale/LocaleService'

export default function (to, from, next) {
  LocaleService.setExistingLocale()
  let promises = [
    FormService.getForm(to.params.formId).then(form => {
      singleton.interview.form = form
    })
  ]
  if (to.query.locale) {
    // TODO: set the locale here
  }
  Promise.all(promises)
    .then(res => {
      next()
    })
    .catch(err => {
      console.error(err)
      next() // TODO: This should do something different on error?
    })
}

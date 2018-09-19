import FormService from '../../../services/form/FormService'
import InterviewService from '../../../services/interview/InterviewService'
import LocaleService from '../../../services/locale/LocaleService'
import RespondentService from '../../../services/respondent/RespondentService'
import {Route} from 'vue-router'
import RespondentFill from '../../../entities/trellis/RespondentFill'
import Locale from '../../../entities/trellis/Locale'
import Interview from '../../../entities/trellis/Interview'
import Action from '../../../entities/trellis/Action'
import Form from '../../../entities/trellis/Form'
import InterviewDataInterface, {ConditionTagInterface} from '../../../services/interview/InterviewDataInterface'
import QuestionDatum from '../../../entities/trellis/QuestionDatum'

export interface InterviewData {
  respondentFills?: RespondentFill[]
  conditionTags?: ConditionTagInterface
  locale: Locale
  form: Form
  data?: QuestionDatum[]
  interview: Interview
  actions?: Action[]
  interviewType: string
}

export default class InterviewLoader {

  /**
   * Get an object with the properties used to hydrate the interview
   * @param {Object} route - A vue-router route
   * @param {Function} progressCb - A function that is called each time progress is made
   * @returns {Promise<Object>}
   */
  static async load (route: Route): Promise<InterviewData> {
    if (route.name === 'Interview') {
      let [res, locale] = [await InterviewLoader.loadInterview(route.params.interviewId), await InterviewLoader.loadLocale(route)]
      return {
        respondentFills: res.respondentFills,
        conditionTags: res.data.conditionTags,
        data: res.data && res.data.data,
        interview: res.interview,
        form: res.form,
        locale,
        actions: res.actions,
        interviewType: 'interview'
      }
    } else {
      let [res, locale] = [await InterviewLoader.loadPreview(route.params.formId), await InterviewLoader.loadLocale(route)]
      return {
        form: res.form,
        locale,
        interview: new Interview().fromSnakeJSON({
          id: 'Preview ID',
          survey: {
            respondent_id: 'Preview respondent id'
          }
        }),
        interviewType: 'preview'
      }
    }
  }

  /**
   * Load everything needed for the preview view
   * @param {String} formId - The id for the form
   * @param {Function} progressCb - Called when a single step of progress is made
   * @returns {Promise<Object>}
   */
  static loadPreview (formId: string): Promise<{form: Form}> {
    return FormService.getForm(formId, true).then(form => {
      return {
        form
      }
    })
  }

  /**
   * Load all of the data needed for an interview
   * @param {String} interviewId - The id for the interview
   * @param {Function} progressCb - Callback for progress updates
   * @returns {{data: <Array>}}
   */
  static loadInterview (interviewId: string): Promise<{
    interview: Interview,
    actions: Action[],
    data: InterviewDataInterface,
    form: Form,
    respondentFills: RespondentFill[]
  }> {
    let interview
    return InterviewService.getInterview(interviewId).then(int => {
      interview = int
      return Promise.all([
        InterviewService.getActions(interviewId),
        InterviewService.getData(interviewId),
        FormService.getForm(interview.survey.formId, true),
        RespondentService.getRespondentFillsById(interview.survey.respondentId),
      ])
    }).then(res => {
      let [actions, data, form, respondentFills] = res
      return {
        interview,
        actions,
        data,
        form,
        respondentFills
      }
    })
  }

  /**
   * Load the locale if it is present in the route. Otherwise return the current locale
   * @param {Object} route - A valid vue-router route
   * @returns {Promise<Object>}
   */
  static loadLocale (route): Promise<Locale> {
    if (route.params.locale) {
      return LocaleService.getLocaleById(route.params.locale)
    } else {
      return new Promise(resolve => {
        resolve(LocaleService.getCurrentLocale())
      })
    }
  }
}

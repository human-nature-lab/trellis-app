import FormService from '../../../services/form'
import InterviewService from '../../../services/interview'
import LocaleService from '../../../services/locale'
import RespondentService from '../../../services/respondent'
import { Route } from 'vue-router'
import RespondentFill from '../../../entities/trellis/RespondentFill'
import Locale from '../../../entities/trellis/Locale'
import Interview from '../../../entities/trellis/Interview'
import Action from '../../../entities/trellis/Action'
import Form from '../../../entities/trellis/Form'
import InterviewDataInterface, { ConditionTagInterface } from '../../../services/interview/InterviewDataInterface'
import QuestionDatum from '../../../entities/trellis/QuestionDatum'
import RespondentConditionTag from '../../../entities/trellis/RespondentConditionTag'
import { defaultLoggingService as logger } from '../../../services/logging'
import { AddSnack } from '../../SnackbarQueue.vue'
import Respondent from '@/entities/trellis/Respondent'

export interface InterviewData {
  respondentFills?: RespondentFill[]
  conditionTags?: ConditionTagInterface
  locale: Locale
  form: Form
  respondent?: Respondent
  data?: QuestionDatum[]
  interview: Interview
  actions?: Action[]
  interviewType: string
  baseRespondentConditionTags?: RespondentConditionTag[]
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
      try {
        const [res, locale] = [
          await InterviewLoader.loadInterview(route.params.interviewId),
          await InterviewLoader.loadLocale(route),
        ]
        return {
          respondentFills: res.respondentFills,
          conditionTags: res.data.conditionTags,
          data: res.data && res.data.data,
          interview: res.interview,
          form: res.form,
          respondent: res.respondent,
          locale,
          actions: res.actions,
          interviewType: 'interview',
          baseRespondentConditionTags: res.baseRespondentConditionTags,
        }
      } catch (err) {
        err.component = 'InterviewLoader.ts@load'
        logger.log(err)
        AddSnack('Unable to load interview!', { timeout: 0, color: 'error' })
      }
    } else {
      try {
        const [res, locale] = [
          await InterviewLoader.loadPreview(route.params.formId),
          await InterviewLoader.loadLocale(route),
        ]
        return {
          form: res.form,
          locale,
          interview: new Interview().fromSnakeJSON({
            id: 'Preview ID',
            survey: {
              respondent_id: 'Preview respondent id',
            },
          }),
          interviewType: 'preview',
        }
      } catch (err) {
        err.component = 'InterviewLoader.ts@load'
        logger.log(err)
        AddSnack('Unable to load interview preview!', { timeout: 0, color: 'error' })
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
        form,
      }
    })
  }

  /**
   * Load all of the data needed for an interview
   * @param {String} interviewId - The id for the interview
   * @param {Function} progressCb - Callback for progress updates
   * @returns {{data: <Array>}}
   */
  static async loadInterview (interviewId: string): Promise<{
    interview: Interview,
    actions: Action[],
    data: InterviewDataInterface,
    form: Form,
    respondent: Respondent,
    respondentFills: RespondentFill[],
    baseRespondentConditionTags: RespondentConditionTag[]
  }> {
    const interview = await InterviewService.getInterview(interviewId)
    const [actions, data, form, respondentFills, respondent] = await Promise.all([
      InterviewService.getActions(interviewId),
      InterviewService.getData(interviewId),
      FormService.getForm(interview.survey.formId, true),
      RespondentService.getRespondentFillsById(interview.survey.respondentId),
      RespondentService.getRespondentById(interview.survey.respondentId),
    ])
    // Base respondent condition tags start with all respondent scope condition tags
    let baseRespondentConditionTags: RespondentConditionTag[] = data.conditionTags.respondent

    // Then we need to loop through questions and find all assigned condition tags in this form
    // We'll store the condition tag IDs in this object
    const conditionTagIds = new Map()
    form.sections.forEach((section) => {
      section.questionGroups.forEach((questionGroup) => {
        questionGroup.questions.forEach((question) => {
          question.assignConditionTags.forEach((act) => {
            conditionTagIds.set(act.conditionTagId, true)
          })
        })
      })
    })

    // Now let's filter out any condition tags that may be assigned by the current form
    baseRespondentConditionTags = baseRespondentConditionTags.filter((rct) => {
      return !conditionTagIds.get(rct.conditionTagId)
    })
    // We're left by condition tags that were assigned outside of the scope of this form

    return {
      interview,
      actions,
      data,
      form,
      respondent,
      respondentFills,
      baseRespondentConditionTags,
    }
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

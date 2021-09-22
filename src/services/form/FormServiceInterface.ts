import Form from '../../entities/trellis/Form'
import StudyForm from '../../entities/trellis/StudyForm'
import Skip from '../../entities/trellis/Skip'
import FormSkip from '../../entities/trellis/FormSkip'
import formTypes from '../../static/form.types'

export default interface FormServiceInterface {

  /**
   * Gets all published forms for a study
   * @param {String} studyId
   * @returns {Promise<StudyForm[]>}
   */
  getStudyForms (studyId: string): PromiseLike<StudyForm[]>

  /**
   * Gets all of the forms for a study including unpublished.
   * @param studyId
   */
  getAllStudyForms (studyId: string): PromiseLike<StudyForm[]>

  /**
   * Gets a single form by id
   * @param {string} formId
   * @param {boolean} bareBones - Only get the parts required to navigate the form
   * @returns {PromiseLike<Form>}
   */
  getForm (formId: string, bareBones: boolean): PromiseLike<Form>
  
  /**
   * Get all version of a form
   */
  getVersions (formId: string): PromiseLike<Form[]>

  /**
   * Create a new form in the database
   * @param studyId
   * @param formType
   */
  createForm (studyId: string, formType: formTypes): PromiseLike<StudyForm>

  /**
   * Update an existing form in the database
   * @param form
   */
  updateForm (form: Form): PromiseLike<Form>

  /**
   * Update the StudyForm resource
   * @param studyId
   * @param studyForm
   */
  updateStudyForm (studyId: string, studyForm: StudyForm): PromiseLike<StudyForm>

  /**
   * Creates a download for this form
   * @param studyId
   * @param formId
   */
  exportForm (formId: string): PromiseLike<void>

  /**
   * Delete this form
   * @param studyId
   * @param formId
   */
  deleteForm (studyId: string, formId: string): PromiseLike<any>

  /**
   * Takes an array of study forms and updates their sort order
   * @param studyId
   * @param studyForms
   */
  reorderForms (studyId: string, studyForms: StudyForm[]): PromiseLike<StudyForm[]>
}

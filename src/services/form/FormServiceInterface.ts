import Form from '../../entities/trellis/Form'
import StudyForm from '../../entities/trellis/StudyForm'
import Skip from "../../entities/trellis/Skip";
import FormSkip from "../../entities/trellis/FormSkip";

export default interface FormServiceInterface {

  /**
   * Gets all forms for the current study
   * @param {String} studyId
   * @returns {Promise<StudyForm[]>}
   */
  getStudyForms (studyId: string): Promise<StudyForm[]>

  /**
   * Gets a single form by id
   * @param {string} formId
   * @param {boolean} bareBones - Only get the parts required to navigate the form
   * @returns {Promise<Form>}
   */
  getForm (formId: string, bareBones: boolean): Promise<Form>

  /**
   * Create a new form in the database
   * @param studyId
   * @param form
   */
  createForm (studyId: string, form: Form): Promise<Form>

  /**
   * Update an existing form in the database
   * @param studyId
   * @param form
   */
  updateForm (studyId: string, form: Form): Promise<Form>

  /**
   * Creates a download for this form
   * @param studyId
   * @param formId
   */
  exportForm (formId: string): Promise<void>

  /**
   * Delete this form
   * @param studyId
   * @param formId
   */
  deleteForm (studyId: string, formId: string): Promise<any>

}

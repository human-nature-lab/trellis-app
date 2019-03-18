import Form from '../../entities/trellis/Form'
import StudyForm from '../../entities/trellis/StudyForm'
import Skip from "../../entities/trellis/Skip";
import FormSkip from "../../entities/trellis/FormSkip";
import formTypes from "../../static/form.types";

export default interface FormServiceInterface {

  /**
   * Gets all published forms for a study
   * @param {String} studyId
   * @returns {Promise<StudyForm[]>}
   */
  getStudyForms (studyId: string): Promise<StudyForm[]>

  /**
   * Gets all of the forms for a study including unpublished.
   * @param studyId
   */
  getAllStudyForms (studyId: string): Promise<StudyForm[]>

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
   * @param formType
   */
  createForm (studyId: string, formType: formTypes): Promise<Form>

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

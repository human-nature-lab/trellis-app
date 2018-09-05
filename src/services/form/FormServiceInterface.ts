import Form from "../../entities/trellis/Form";
import StudyForm from "../../entities/trellis/StudyForm";

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

}

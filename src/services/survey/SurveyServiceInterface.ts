import Survey from "../../entities/trellis/Survey";

export default interface SurveyServiceInterface {

  /**
   * Get an existing survey by form id
   * @param {string} studyId
   * @param {string} respondentId
   * @param {string} formId
   * @returns {Promise<Object|null>}
   */
  getSurvey (studyId: string, respondentId: string, formId: string): Promise<Survey>

  /**
   * Get all of the forms for a respondent in this study
   * @param {String} studyId - The study id
   * @param {String} respondentId - The respondent id
   * @returns {Promise<Array>}
   */
  getRespondentSurveys (studyId: string, respondentId: string): Promise<Survey[]>

  /**
   * Create a new survey
   * @param {String} studyId
   * @param {String} respondentId
   * @param {String} formId
   * @returns {*|AxiosPromise<any>}
   */
  create (studyId: string, respondentId: string, formId: string): Promise<Survey>
}

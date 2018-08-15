import http from '../http/AxiosInstance'
import formTypes from '../../static/form.types'
import FormServiceInterface from "./FormServiceInterface";
import StudyForm from "../../entities/trellis/StudyForm";
import Form from "../../entities/trellis/Form";
export class FormServiceWeb implements FormServiceInterface {

  /**
   * Gets all forms for the current study
   * @param {String} studyId
   * @returns {Promise<Array>}
   */
  getStudyForms (studyId: string): Promise<StudyForm[]> {
    return http().get(`study/${studyId}/forms/published`, {
      params: {
        form_type_id: formTypes.data_collection_form
      }
    }).then(res => {
      if (res.data.forms) {
        return res.data.forms.map(form => new StudyForm().fromSnakeJSON(form))
      } else {
        console.error(res)
        throw Error('Unable to retrieve forms')
      }
    })
  }

  /**
   * Gets a single form by id
   * @param {String} formId
   * @returns {Promise<Object>}
   */
  getForm (formId: string): Promise<Form> {
    return http().get(`form/${formId}`)
      .then(res => {
        if (res.data.form) {
          // let form = new Form().fromSnakeJSON(res.data.form)
          // console.log(form)
          return new Form().fromSnakeJSON(res.data.form)
        } else {
          console.error(res)
          throw Error('Unable to retrieve form')
        }
      })
  }

}

export default FormServiceWeb

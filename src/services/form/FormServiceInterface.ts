import Form from "../../entities/trellis/Form";

export default interface FormServiceInterface {
  getStudyForms (studyId: string): Promise<Array<Form>>
  getForm (formId: string): Promise<Form>
}

import Form from "../../entities/trellis/Form";
import StudyForm from "../../entities/trellis/StudyForm";

export default interface FormServiceInterface {
  getStudyForms (studyId: string): Promise<StudyForm[]>
  getForm (formId: string): Promise<Form>
}

export interface ConditionAssignmentError {
  page: number
  section: number
  sectionRepetition: number
  sectionFollowUpRepetition: number
  logic: string
  error: {
    component: string,
    stack: string,
    message: string,
    name: string
  }
}

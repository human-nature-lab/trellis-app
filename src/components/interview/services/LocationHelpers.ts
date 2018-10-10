import {InterviewLocation} from "./InterviewAlligator";

export function locToNumber (loc: InterviewLocation): number {
  return Math.pow(100, 4) * (loc.section || 0) + Math.pow(100, 3) * (loc.sectionRepetition || 0) + Math.pow(100, 2) * (loc.sectionFollowUpRepetition || 0) + (loc.page || 0)
}

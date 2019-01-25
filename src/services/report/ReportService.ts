import Report from "../../entities/web/Report";
import {adminInst} from '../http/AxiosInstance'

export enum StudyReportType {
  RESPONDENT = 'respondent',
  ACTIONS = 'action',
  EDGES = 'edge',
  LOCATIONS = 'geo',
  RESPONDENT_LOCATIONS = 'respondent_geo',
  INTERVIEWS = 'interview',
  TIMING = 'timing'
}

class ReportService {

  /**
   * Get all of the latest reports from a study
   * @param {string} studyId
   * @returns {Promise<Report[]>}
   */
  async getLatestReports (studyId: string): Promise<Report[]> {
    studyId = encodeURIComponent(studyId)
    const res = await adminInst.get(`study/${studyId}/reports/latest`)
    return res.data.reports.map(r => new Report().fromSnakeJSON(r))
  }

  /**
   * Start reporting jobs for a list of study form types and form ids
   * @param {string} studyId
   * @param {string[]} formIds
   * @returns {Promise<Report[]>}
   */
  async dispatchReports (studyId: string, studyReportTypes: string[], formIds: string[]): Promise<Report[]> {
    studyId = encodeURIComponent(studyId)
    const res = await adminInst.post(`study/${studyId}/reports/dispatch`, {
      study_types: studyReportTypes,
      forms: formIds
    })
    return res.data.reports.map(r => new Report().fromSnakeJSON(r))
  }

  /**
   * Check the status of multiple reports
   * @param {string[]} reportIds
   * @returns {Promise<ReportStatus[]>}
   */
  async getReportsZip (studyId: string, reportIds: string[]): Promise<Blob> {
    studyId = encodeURIComponent(studyId)
    const res = await adminInst.get(`study/${studyId}/reports/download`, {
      responseType: 'blob',
      params: {
        reports: reportIds
      }
    })
    return res.data
  }

  async getReports (reportIds: string[]): Promise<Report[]> {
    throw new Error('Unimplemented')
  }

}


export default new ReportService()

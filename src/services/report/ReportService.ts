import { LaravelPaginated } from '../../types/Pagination'
import { Report } from '../../entities/web/Report'
import { ReportType } from '../../entities/web/ReportType'
import { ReportFile } from '../../entities/web/ReportFile'
import { adminInst } from '../http/AxiosInstance'
import { uriTemplate } from '../http/WebUtils'

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
  
  async getAvailableTypes (): Promise<ReportType[]> {
    const res = await adminInst.get(`reportsv2/available`)
    return res.data.map(d => {
      const n = new ReportType().fromSnakeJSON(d)
      n.configSchema = d.configSchema
      return n
    })
  }

  /**
   * Get all of the latest reports from a study
   * @param {string} studyId
   * @returns {Promise<Report[]>}
   */
  async getLatestReports (studyId: string, reports: string[]): Promise<Report[]> {
    const res = await adminInst.get(uriTemplate('study/{studyId}/reportsv2/latest', [studyId]), {
      params: {
        reports: reports.join(',')
      }
    })
    return res.data.map(r => new Report().fromSnakeJSON(r))
  }
  
  async getReportsForType (studyId: string, type: string): Promise<LaravelPaginated<Report[]>> {
    const res = await adminInst.get<LaravelPaginated<any>>(uriTemplate('study/{studyId}/reportsv2/{type}/completed', [studyId, type]))
    const d = res.data
    d.data = d.data.map(r => new Report().fromSnakeJSON(r))
    return d
  }
  
  /**
   * Start reporting jobs for a list of study form types and form ids
   * @param {string} studyId
   * @param {string[]} formIds
   * @returns {Promise<Report[]>}
   */
  async dispatchReports (studyId: string, studyReportTypes: string[], config: object): Promise<Report[]> {
    const c = JSON.stringify(config)
    const reports = []
    for (const name of studyReportTypes) {
      const res = await adminInst.post(uriTemplate('study/{studyId}/reportsv2/{name}/dispatch', [studyId, name]), {
        config: c
      })
      reports.push(new Report().fromSnakeJSON(res.data))
    }
    return reports
  }

  /**
   * Check the status of multiple reports
   * @param {string[]} reportIds
   * @returns {Promise<ReportStatus[]>}
   */
  async getReportsZip (studyId: string, reportIds: string[], progress?: (ev: ProgressEvent) => any): Promise<Blob> {
    studyId = encodeURIComponent(studyId)
    const res = await adminInst.get(`study/${studyId}/reportsv2/download`, {
      responseType: 'blob',
      params: {
        reports: reportIds
      },
      onDownloadProgress (ev) {
        if (progress) progress(ev)
      }
    })
    return res.data
  }

  /**
   * Get one or more report objects from the server.
   * @param studyId
   * @param reportIds
   */
  async getReports (studyId: string, reportIds: string[]): Promise<Report[]> {
    studyId = encodeURIComponent(studyId)
    const res = await adminInst.get(`study/${studyId}/reports/${reportIds.join(',')}`)
    return res.data.reports.map(r => new Report().fromSnakeJSON(r))
  }

}


export default new ReportService()

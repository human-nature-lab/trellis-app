import store, { NamespaceStore } from '@/services/kv/index.mobile'
import { ref } from 'vue'
import { Pair } from './common'

type ReportRow = {
  respondentId: string
  pair: Pair
  kept: number
  given: number
  total: number
}

export type Report = {
  devices: string[]
  rows: ReportRow[]
}

export type ReportStatus = {
  report: Report
  savedAt: Date
}

export function useReports (formId: string, deviceId: string) {
  const kv = new NamespaceStore(store, 'dictator' + formId + deviceId)
  const reports = ref<ReportStatus[]>()
  const loading = ref(false)
  const error = ref()
  async function load () {
    try {
      loading.value = true
      const res = await kv.all()
      const d = res.map(r => (JSON.parse(r.value) as ReportStatus))
      for (const r of d) {
        r.savedAt = new Date(r.savedAt)
      }
      d.sort((a, b) => {
        return b.savedAt.getTime() - a.savedAt.getTime()
      })
      reports.value = d
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  load()

  async function pushReport (report: Report) {
    try {
      loading.value = true
      const savedAt = new Date()
      const reportStatus = { report, savedAt }
      await kv.set(savedAt.toISOString(), JSON.stringify(reportStatus))
      reports.value.push(reportStatus)
      reports.value.sort((a, b) => {
        return b.savedAt.getTime() - a.savedAt.getTime()
      })
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  return { reports, pushReport, loading, error }
}

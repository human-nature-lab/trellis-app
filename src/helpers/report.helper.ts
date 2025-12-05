import { watch, ref, WatchSource, Ref } from 'vue'
import type { Table } from '@/components/table/types'
import { useStudy } from './singleton.helper'
import { adminInst } from '@/services/http/AxiosInstance'

export function useReport (reportName: WatchSource<string>) {
  const report = ref<Table<any>>()
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const ready = ref(false)
  const study = useStudy()

  async function load (name: string) {
    if (!name || loading.value) {
      return
    }
    loading.value = true
    error.value = null
    try {
      const res = await adminInst.get(`/study/${study.value?.id}/report/custom/${name}`)
      report.value = res.data
      ready.value = true
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }
  async function reload () {
    // Unwrap the WatchSource to get the current value (works for both Ref and getter fn)
    const name = typeof reportName === 'function' ? reportName() : (reportName as Ref<string>).value
    return load(name)
  }
  watch(reportName, (name) => {
    load(name)
  }, { immediate: true })
  return { report, loading, ready, error, reload }
}

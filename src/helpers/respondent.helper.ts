import { WatchSource, ref, watch } from 'vue'
import RespondentService from '@/services/respondent'
import Respondent from '@/entities/trellis/Respondent'

export function useRespondent (id: string) {
  const respondent = ref<Respondent | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  async function reload () {
    try {
      loading.value = true
      respondent.value = await RespondentService.getRespondentById(id)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  reload()
  return { respondent, error, loading, reload }
}

export function useRespondents (ids: string[]) {
  const respondents = ref<Respondent[]>([])
  const error = ref<Error | null>(null)
  const loading = ref(false)
  async function reload () {
    try {
      loading.value = true
      respondents.value = await Promise.all(ids.map(id => RespondentService.getRespondentById(id)))
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  reload()
  return { respondents, error, loading, reload }
}

export function watchRespondents (source: WatchSource<string[]>) {
  const respondents = ref<Record<string, Respondent>>({})
  const error = ref<Error | null>(null)
  const loading = ref(false)

  let pending = []
  async function loadPending (respondentIds: string[]) {
    const newRespondentIds = respondentIds.filter(id => !respondents.value[id] && !pending.includes(id))
    if (newRespondentIds.length === 0) return
    pending.push(...newRespondentIds)
    loading.value = true
    try {
      const newRespondents = await Promise.all(newRespondentIds.map(id => RespondentService.getRespondentById(id)))
      for (const r of newRespondents) {
        respondents.value[r.id] = r
      }
      respondents.value = { ...respondents.value }
      pending = pending.filter(id => !newRespondentIds.includes(id))
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  watch(source, loadPending, { immediate: true })

  return { respondents, error, loading }
}

import { ref } from 'vue'
import RespondentService from '@/services/respondent'
import Respondent from '@/entities/trellis/Respondent'
import { RespondentServiceCordova } from '@/services/respondent/RespondentServiceCordova'

const rs = RespondentService as RespondentServiceCordova

export function useRespondent (id: string) {
  const respondent = ref<Respondent | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  async function reload () {
    try {
      loading.value = true
      respondent.value = await rs.getRespondentById(id)
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
      respondents.value = await Promise.all(ids.map(id => rs.getRespondentById(id)))
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  reload()
  return { respondents, error, loading, reload }
}

import { WatchSource, ref, watch } from 'vue'
import FormService from '@/services/form'
import InterviewService from '@/services/interview'
import Form from '@/entities/trellis/Form'
import Interview from '@/entities/trellis/Interview'
import Survey from '@/entities/trellis/Survey'
import InterviewDataInterface from '@/services/interview/InterviewDataInterface'

export function useSurveyData (source: WatchSource<Survey>) {
  const form = ref<Form>(null)
  const interview = ref<Interview>(null)
  const data = ref<InterviewDataInterface>(null)
  const loading = ref(false)
  const error = ref(null)

  watch(source, async survey => {
    loading.value = true
    try {
      if (!survey || !survey.interviews || !survey.interviews.length) {
        throw new Error('Interview not found')
      }
      const interviewId = survey.interviews[0].id;

      [interview.value, data.value, form.value] = await Promise.all([
        InterviewService.getInterview(interviewId),
        InterviewService.getData(interviewId),
        FormService.getForm(survey.formId),
      ])
      form.value.sort()
      error.value = null
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }, { immediate: true })

  return { form, data, interview, loading, error }
}

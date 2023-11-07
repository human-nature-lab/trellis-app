import { computed, onBeforeUnmount, ref } from 'vue'
import InterviewManager, { watchSharedInterview } from '@/components/interview/classes/InterviewManager'

export function useManager () {
  const managerInstance = ref<InterviewManager>()
  const unsubscribe = watchSharedInterview(m => {
    managerInstance.value = m
  })
  onBeforeUnmount(unsubscribe)
  return managerInstance
}

export function useDataStore () {
  const manager = useManager()
  return computed(() => {
    const res = manager.value ? manager.value.data : null
    debugger
    console.log('useDataStore computed', res)
    return res
  })
}

import { inject } from 'vue'
import DataStore from '@/components/interview/classes/DataStore'
import InterviewManager, { sharedInterviewInstance } from '@/components/interview/classes/InterviewManager'
import { data, manager } from '@/symbols/interview'

export function useManager (): InterviewManager {
  return inject(manager) || sharedInterviewInstance
}

export function useDataStore (): DataStore {
  return inject(data) || sharedInterviewInstance.data
}

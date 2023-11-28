import { getCurrentInstance } from 'vue'

export function useVuetify () {
  const c = getCurrentInstance()
  if (c) {
    return c.proxy.$vuetify
  }
  return null
}

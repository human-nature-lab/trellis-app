import { computed } from 'vue'
import config from '@/config'
import global from '@/static/singleton'
import { APP_ENV } from '@/static/constants'

export const isWeb = computed(() => {
  return config.appEnv === APP_ENV.WEB
})
export const isCordova = computed(() => {
  return config.appEnv === APP_ENV.CORDOVA
})
export const isDebug = computed(() => {
  return config.debug
})

export const isLoggedIn = computed(() => {
  return !!global && !!global.user
})

export const isTestStudy = computed(() => {
  return !!global.study && !global.study.testStudyId
})

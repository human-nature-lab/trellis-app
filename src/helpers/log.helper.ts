import { AddSnack, SnackConfig } from '@/components/SnackbarQueue.vue'
import { TranslateResult } from 'vue-i18n'
import { defaultLoggingService } from '@/services/logging'
import Log from '@/entities/trellis-config/Log'
import { getCurrentInstance } from 'vue'

export function alert (color: TranslateResult, msg?: TranslateResult, config: Partial<SnackConfig> = {}) {
  config.color = color + ''
  AddSnack(msg, config)
}

export function log (log: any): Promise<Log> {
  if (typeof log === 'object' && log && !log.component) {
    const instance = getCurrentInstance()
    debugger
    log.component = instance.type.__name
  }
  return defaultLoggingService.log(log)
}

export function logError (err, message?: string | TranslateResult) {
  message = message || err.message
  log(err)
  alert('error', message, { timeout: 0 })
}

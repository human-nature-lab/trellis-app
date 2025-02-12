import { AddSnack, SnackConfig } from '@/components/SnackbarQueue.vue'
import { TranslateResult } from 'vue-i18n'
import { defaultLoggingService } from '@/services/logging'
import Log from '@/entities/trellis-config/Log'
import { getCurrentInstance } from 'vue'

export function alert (color: TranslateResult, msg?: TranslateResult, config: Partial<SnackConfig> = {}) {
  config.color = color + ''
  AddSnack(msg, config)
}

export function alertSuccess (msg: TranslateResult, config: Partial<SnackConfig> = {}) {
  alert('success', msg, config)
}

export function log (log: any): Promise<Log> {
  if (typeof log === 'object' && log && !log.component) {
    const instance = getCurrentInstance()
    if (instance) {
      if (instance.type && instance.type.__name) {
        log.component = instance.type.__name
      } else if (instance.proxy && instance.proxy.$vnode && instance.proxy.$vnode.tag) {
        log.component = instance.proxy.$vnode.tag
      } else {
        log.component = 'Unknown component at: ' + new Error().stack
      }
    }
  }
  return defaultLoggingService.log(log)
}

export function logError (err, message?: string | TranslateResult) {
  message = message || err.message
  log(err)
  alert('error', message, { timeout: 0 })
}

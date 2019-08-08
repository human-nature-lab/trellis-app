import Axios, { AxiosError, AxiosInstance, AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios'
import config from 'config'
import { TranslateResult } from 'vue-i18n'
import { APP_ENV } from '../static/constants'
import Vue, { Component } from 'vue'
import { defaultLoggingService } from '../services/logging/LoggingService'
import Log from '../entities/trellis-config/Log'
import { TrellisPermission } from '../static/permissions.base'
// @ts-ignore
import { AddSnack } from '../components/SnackbarQueue'

export default Vue.mixin({
  data () {
    return {
      TrellisPermission
    }
  },
  methods: {
    log (log: any): Promise<Log> {
      if (log && !log.component) {
        log.component = this.$options.name
      }
      return defaultLoggingService.log(log)
    },
    addSnack (msg, config?) {
      AddSnack(msg, config)
    },
    alert (color: string, msg, config?) {
      config = config ? config : {}
      config.color = color
      AddSnack(msg, config)
    },
    logError (err, message?: string | TranslateResult) {
      message = message || err.message
      this.log(err)
      this.alert('error', message, { timeout: 0 })
    },
    isNotAuthError (err: AxiosError | AxiosResponse): boolean {
      // @ts-ignore
      const isAuthError = err && ((err.response && err.response.status === 401) || err.status === 401)
      if (isAuthError) {
        this.alert('info', this.$t('not_logged_in'))
      }
      return !isAuthError
    }
  },
  computed: {
    isWeb (): boolean {
      return config.appEnv === APP_ENV.WEB
    },
    isCordova (): boolean {
      return config.appEnv === APP_ENV.CORDOVA
    },
    isDebug (): boolean {
      return config.debug
    }
  }
})

declare module 'vue/types/vue' {
  interface Vue {
    log (log: any): Promise<Log>
    addSnack (msg, config?): void
    alert (color: string, msg, config?): void
    logError (err: Error, msg?: string | TranslateResult): void
    isNotAuthError (err: AxiosError): boolean
    isWeb: boolean
    isCordova: boolean
    isDebug: boolean
    hydrate (data: any): any
    leaving (): any
  }
}

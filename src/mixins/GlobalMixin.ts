import config from 'config'
import {APP_ENV} from '../static/constants'
import Vue, {Component} from 'vue'
import {defaultLoggingService} from '../services/logging/LoggingService'
import Log from '../entities/trellis-config/Log'
import {TrellisPermission} from '../static/permissions.base'
// @ts-ignore
import {AddSnack} from '../components/SnackbarQueue'

export default Vue.mixin({
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
    isWeb: boolean
    isCordova: boolean
    isDebug: boolean
    hydrate (data: any): any
    leaving (): any
  }
}

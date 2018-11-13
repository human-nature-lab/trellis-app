import config from '../config'
import {APP_ENV} from '../static/constants'
import Vue from 'vue'
import {defaultLoggingService} from '../services/logging/LoggingService'
import Log from "../entities/trellis-config/Log";

export default Vue.mixin({
  methods: {
    log (this: Vue, log: any): Promise<Log> {
      if (log && !log.component) {
        log.component = this.$options.name
      }
      return defaultLoggingService.log(log)
    }
  },
  computed: {
    isWeb (): boolean {
      return config.appEnv === APP_ENV.WEB
    },
    isCordova (): boolean {
      return config.appEnv === APP_ENV.CORDOVA
    }
  }
})

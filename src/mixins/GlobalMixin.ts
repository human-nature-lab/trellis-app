import config from '../config'
import {APP_ENV} from '../static/constants'
import Vue from 'vue'
import {defaultLoggingService} from '../services/logging/LoggingService'

export default Vue.mixin({
  methods: {
    log (this: Vue, log: any): void {
      if (log && !log.component) {
        log.component = this.$options.name
      }
      defaultLoggingService.log(log)
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

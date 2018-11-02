import config from '../config'
import {APP_ENV} from '../static/constants'
import Vue from 'vue'
import logger from '../services/logging/LoggingService'

export default Vue.mixin({
  methods: {
    log (Log): void {
      logger.log()
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

import config from '../config'
import {APP_ENV} from '../static/constants'
import Vue from 'vue'

export default Vue.mixin({
  methods: {
    log (...args: any[]): void {
      if (config.debug) {
        console.log(...args)
      }
    },
    debug (...args: any[]): void {
      if (config.debug) {
        console.debug(...args)
      }
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

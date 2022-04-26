import Vue from 'vue'
import config from '../config'
import { APP_ENV } from '../static/constants'

export default Vue.extend({
  data () {
    return {
      config
    }
  },
  computed: {
    isWeb (): boolean {
      return config.appEnv === APP_ENV.WEB
    },
    isMobile (): boolean {
      return config.appEnv === APP_ENV.CORDOVA
    }
  }
})
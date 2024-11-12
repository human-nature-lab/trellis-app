// import './timeoutTracker'
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'reflect-metadata'
import './assets/main.sass'

import Vue from 'vue'
import VueCordova from 'vue-cordova'
import { i18n } from './i18n'
import './mixins/GlobalMixin'
import 'typeface-roboto/index.css'
import Debug from './components/Debug.vue'
import router from './router'

import config from './config'
import ConfigService from './services/config'
import vuetify from './plugins/vuetify'
import { APP_ENV } from './static/constants'
import './logging'
import './filters/toFixed.filter'
import WebApp from './WebApp.vue'
// import './checkWebviewVersion'

async function init () {
  // Wait for the configuration to load before doing anything else
  await ConfigService.load()

  Vue.config.productionTip = false
  if (config.appEnv === APP_ENV.CORDOVA) {
    Vue.use(VueCordova)
  }
  Vue.component('Debug', Debug)

  new Vue({
    el: '#app',
    router,
    i18n,
    vuetify,
    template: '<WebApp />',
    components: {
      WebApp,
    },
  })
}

init()

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import VueCordova from 'vue-cordova'
import VueHead from 'vue-head'
import i18n from './i18n'
import Debug from './components/Debug'
import './mixins/GlobalMixin'
import 'typeface-roboto/index.css'
import 'material-design-icons-iconfont'

import WebApp from './WebApp'
import router from './router'

import config from './config'
import theme from './static/theme'
import {APP_ENV} from './static/constants'

Vue.use(Vuetify, theme)
Vue.config.productionTip = false
Vue.use(VueHead)
if (config.appEnv === APP_ENV.CORDOVA) {
  Vue.use(VueCordova)
}
Vue.component('debug', Debug)

// add cordova.js only if serving the app through file://
if (window.location.protocol === 'file:' || window.location.port === '3000') {
  let cordovaScript = document.createElement('script')
  cordovaScript.setAttribute('type', 'text/javascript')
  cordovaScript.setAttribute('src', 'cordova.js')
  document.body.appendChild(cordovaScript)
}

/* eslint-disable no-new */
export default new Vue({
  el: '#app',
  router,
  i18n,
  template: '<WebApp />',
  components: {
    WebApp
  },
  head: {
    meta: [
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      }
    ]
  }
})

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import VueCordova from 'vue-cordova'
import VueHead from 'vue-head'
import Debug from '@/components/Debug'
// import 'material-design-icons-iconfont'

import App from './App'
import WebApp from './WebApp'
import router from './router/router'

import config from './config'
import theme from './theme'
import {APP_ENV} from './constants'

// Flag for debug
Vue.use(Vuetify, theme)
Vue.config.productionTip = false
Vue.use(VueHead)
if (config.appEnv === APP_ENV.CORDOVA) {
  Vue.use(VueCordova)
}
Vue.component('debug', Debug)

// add cordova.js only if serving the app through file://
if (window.location.protocol === 'file:' || window.location.port === '3000') {
  var cordovaScript = document.createElement('script')
  cordovaScript.setAttribute('type', 'text/javascript')
  cordovaScript.setAttribute('src', 'cordova.js')
  document.body.appendChild(cordovaScript)
}

// Global component mixins
Vue.mixin({
  methods: {
    log: function (...args) {
      if (config.debug) {
        console.log(...args)
      }
    },
    debug: function (...args) {
      if (config.debug) {
        console.debug(...args)
      }
    },
    anyValueMatches: function (iterable, value) {
      for (let key in iterable) {
        if (iterable[key] === value) {
          return true
        }
      }
      return false
    },
    isWeb: function () {
      return config.appEnv === APP_ENV.WEB
    },
    isCordova: function () {
      return config.appEnv === APP_ENV.CORDOVA
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: config.appEnv === APP_ENV.WEB ? '<WebApp />' : '<App />',
  components: {
    App,
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

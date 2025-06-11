import 'reflect-metadata'
import Vue from 'vue'
import TestApp from './TestApp.vue'
import vuetify from '@/plugins/vuetify'

new Vue({
  vuetify,
  render: h => h(TestApp),
}).$mount('#app')

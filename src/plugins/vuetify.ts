import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

export default new Vuetify({
  icons: {
    iconfont: 'mdi' // default - only for display purposes
  },
  theme: {
    themes: {
      light: {
        primary: '#E64A19',
        secondary: '#FFCCBC',
        accent: '#93C0A4'
        // accent: '#607D8B'
        // error: '#DD2C00',
        // warning: '#F2C078',
        // info: '#3E7CB1',
        // success: '#AFD2E9'
      }
    }
  }
})
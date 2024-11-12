import Vue, { getCurrentInstance } from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import theme from '../static/theme'

Vue.use(Vuetify)

export default new Vuetify({
  icons: {
    iconfont: 'mdi', // default - only for display purposes
  },
  theme,
})

// useVuetify.ts

export function useVuetify () {
  const instance = getCurrentInstance()
  if (!instance) {
    throw new Error('useVuetify should be called in setup().')
  }
  return instance.proxy.$vuetify
}

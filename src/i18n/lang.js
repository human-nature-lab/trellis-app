import translations from './translations.csv'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

let locales = translations.shift().filter(t => t !== 'key')

debugger
// Transform the translations into the required format for the vue-i18n plugin
/**
 * {
 *    en: {
 *      title: 'Trellis'
 *    },
 *    es: {
 *      title: 'Trellis'
 *    }
 * }
 */
let messages = locales.reduce((agg, l) => {
  agg[l] = {}
  return agg
}, {})
messages = translations.reduce((trans, t) => {
  for (let i = 0; i < locales.length; i++) {
    trans[locales[i]][t[0]] = t[i + 1]
  }
  return trans
}, messages)

const i18n = new VueI18n({
  locale: 'en',
  messages
})

// Exports the lang configuration for Vuetify constructor
export default {
  t: (key, ...params) => i18n.t(key, params)
}

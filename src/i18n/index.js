import translations from './translations.csv'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

let locales = translations.shift().filter(t => t !== 'key' && t !== 'comment')

// Transform the translations into the required format for the vue-index plugin
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
    if (t[i + 1]) {
      trans[locales[i]][t[0]] = t[i + 1]
    }
  }
  return trans
}, messages)

export default new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

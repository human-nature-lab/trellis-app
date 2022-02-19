import VueI18n from 'vue-i18n'
import Vue from 'vue'
import en from './en.json'
Vue.use(VueI18n)

const langMap = {
  en: () => import('./en.json'),
  es: () => import('./es.json'),
}

export const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
  }
})

const loadedLanguages = ['en']

function setI18nLanguage(lang) {
  i18n.locale = lang
  // axios.defaults.headers.common['Accept-Language'] = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}

export function loadLanguageAsync(lang: string) {
  // If the language was already loaded or the same language
  if (loadedLanguages.includes(lang) || i18n.locale === lang) {
    return Promise.resolve(setI18nLanguage(lang))
  }

  if (lang in langMap) {
    return langMap[lang]().then(messages => {
      i18n.setLocaleMessage(lang, messages.default)
      loadedLanguages.push(lang)
      return setI18nLanguage(lang)
    })
  } else {
    throw new Error('unsupported language ' + lang)
  }
}

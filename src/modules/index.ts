import config from '@/config'
import { i18n } from '@/i18n'
import { guardQueue } from '@/router/GuardQueue'
import LocaleGuard from '@/router/guards/LocaleGuard'
import LoginGuard from '@/router/guards/LoginGuard'
import StudyGuard from '@/router/guards/StudyGuard'
const DictatorAsync = () => import(/* webpackChunkName: "dictator-async" */'./dictator-async/DictatorAsync.vue')

console.log('config', JSON.stringify(config, null, 2))

export const extraModules = {
  dictatorAsync: {
    label: i18n.t('dictator_async'),
    enabled: () => !!(config.extraModules && config.extraModules.dictatorAsync),
    to: { name: 'DictatorAsync' },
    routes: [{
      path: '/extra-modules/dictator-async',
      name: 'DictatorAsync',
      component: DictatorAsync,
      beforeEntry: guardQueue([LoginGuard, StudyGuard, LocaleGuard]),
    }],
  },
}

export const extraRoutes = []
for (const m of Object.values(extraModules)) {
  extraRoutes.push(...m.routes)
}

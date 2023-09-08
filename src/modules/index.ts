import config from '@/config'
import { i18n } from '@/i18n'

export const extraModules = {
  dictatorAsync: {
    label: i18n.t('dictator_async'),
    enabled: !!(config.extraModules && config.extraModules.dictatorAsync),
    routes: [{
      path: '/nearby-comms/dictator-async',
      name: 'DictatorAsync',
      component: () => import(/* webpackChunkName: "dictator-async" */'./dictator-async/DictatorAsync.vue'),
    }],
  },
}

// Filter out routes that are not enabled in config
export const extraRoutes = []
for (const m of Object.values(extraModules)) {
  if (m.enabled) {
    extraRoutes.push(...m.routes)
  }
}

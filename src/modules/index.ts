import { computed } from 'vue'
import config from '@/config'
import { i18n } from '@/i18n'
const DictatorAsync = () => import(/* webpackChunkName: "dictator-async" */'./dictator-async/DictatorAsync.vue')

console.log('config', JSON.stringify(config, null, 2))

export const extraModules = {
  dictatorAsync: {
    label: i18n.t('dictator_async'),
    enabled: () => !!(config.extraModules && config.extraModules.dictatorAsync),
    to: { name: 'DictatorAsync' },
    routes: [{
      path: '/nearby-comms/dictator-async',
      name: 'DictatorAsync',
      component: DictatorAsync,
    }],
  },
}

export const extraRoutes = []
for (const m of Object.values(extraModules)) {
  extraRoutes.push(...m.routes)
}

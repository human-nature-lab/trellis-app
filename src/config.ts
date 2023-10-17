import { reactive, watch } from "vue"

type Config = {
  apiRoot: string
  appEnv: string
  appMode: 'PROD' | 'DEV'
  serverMode?: 'PROD' | 'DEV'
  siteName?: string
  formBuilderUrl?: string
  extraModules?: {
    dictatorAsync?: boolean
  }
  logging?: {
    console: boolean
    levels: string
    max: number
    rate: number
  }
  mapTileLayer?: {
    accessToken: string
    attribution: string
    url: string
    style: string
    id: string
    maxZoom: number
  }
  sentry?: {
    dsn: string
    offline: boolean
    onlineIntervalRate: number
  }
  demo?: {
    expirationTime: number
  }
  debug?: boolean
  checkServerTime?: boolean
  webRoot?: string
  user?: {
    username: string
    roleId: string
    password: string
  }
}

const config = reactive((window.config! || {}) as Config)
console.log('config', JSON.stringify(config, null, 2))
watch(config, () => {
  console.log('config changed', JSON.stringify(config))
  return null
})
export default config

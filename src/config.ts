//@ts-ignore
const c = window.config
console.log('config', c)
export default c as {
  apiRoot: string
  appEnv: string
  sentry?: {
    dsn: string
    offline: boolean
  }
  debug?: boolean
  compareTime?: boolean
}

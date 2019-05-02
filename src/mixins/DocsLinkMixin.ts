import config from 'config'
import global from '../static/singleton'
import bus, {DocsEventTypes} from '../components/documentation/DocsEventBus'

let previousState
export default function DocsLinkMixin (docLink: any) {
  return config.debug ? {
    beforeRouteEnter (to, from, next) {
      console.log('updating documentation link', docLink)
      previousState = JSON.parse(JSON.stringify(global.secondaryDrawer))
      previousState.onClick = global.secondaryDrawer.onClick
      global.secondaryDrawer.isEnabled = true
      global.secondaryDrawer.icon = 'help_outline'
      global.secondaryDrawer.onClick = () => {
        bus.$emit(DocsEventTypes.open, docLink)
      }
      next()
    },
    beforeRouteLeave (to, from, next) {
      if (previousState) {
        global.secondaryDrawer.isEnabled = previousState.isEnabled
        global.secondaryDrawer.icon = previousState.icon
        global.secondaryDrawer.onClick = previousState.onClick
        next()
      } else {
        previousState = null
      }
    }
  } : {}
}

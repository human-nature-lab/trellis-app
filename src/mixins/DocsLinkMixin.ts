import config from 'config'
import global from '../static/singleton'
import bus, {DocsEventTypes} from '../components/documentation/DocsEventBus'

export default function DocsLinkMixin (docLink: any) {

  let previousState
  function detachDocLink () {
    if (previousState) {
      global.secondaryDrawer.isEnabled = previousState.isEnabled
      global.secondaryDrawer.icon = previousState.icon
      global.secondaryDrawer.onClick = previousState.onClick
    } else {
      previousState = null
    }
  }

  function attachDocLink () {
    console.log('updating documentation link', docLink)
    previousState = JSON.parse(JSON.stringify(global.secondaryDrawer))
    previousState.onClick = global.secondaryDrawer.onClick
    global.secondaryDrawer.isEnabled = true
    global.secondaryDrawer.icon = 'help_outline'
    global.secondaryDrawer.onClick = () => {
      bus.$emit(DocsEventTypes.open, docLink)
    }
  }

  return {
    data () {
      return {
        config
      }
    },
    beforeRouteEnter (to, from, next) {
      if (config.debug) {
        attachDocLink()
      }
      next()
    },
    beforeRouteLeave (to, from, next) {
      detachDocLink()
      next()
    },
    watch: {
      'config.debug' (newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          attachDocLink()
        } else if (!newVal) {
          detachDocLink()
        }
      }
    }
  }
}

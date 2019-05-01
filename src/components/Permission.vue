<script lang="ts">
  /**
   * This component uses a render function to avoid the limitations of templates. Templates cannot have slots as the root
   * and, thus, don't allow us to selectively show or hide a component without altering the DOM by adding an unnecessary.
   */
  import PermissionMixin from '../mixins/PermissionMixin'
  import Vue, { VNode } from 'vue'
  import { TrellisPermission } from '../static/permissions.base'

  // @ts-ignore
  export default Vue.extend({
    name: 'permission',
    mixins: [PermissionMixin],
    props: {
      roleWhitelist: {
        type: Array as () => string[],
        default: () => []
      },
      roleBlacklist: {
        type: Array as () => string[],
        default: () => []
      },
      requires: Number as () => TrellisPermission,
      webOnly: {
        type: Boolean,
        default: false
      },
      mobileOnly: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      isVisible: {
        cache: false,
        get (): boolean {
          const isCorrectPlatform = (this.webOnly !== false && this.isWeb) || (this.mobileOnly !== false && this.isCordova)
          const isUserLoaded = this.global && !!this.global.user

          if (!isCorrectPlatform) {
            return false
          } else if (isCorrectPlatform && this.onlyHasPlatform) {
            return true
          } else if (!isUserLoaded) {
            return false
          } else if (this.requires != null) {
            return this.hasPermission(this.requires)
          } else if (this.roleWhitelist.length) {
            return this.userInWhitelist()
          } else if (this.roleBlacklist.length) {
            return !this.userInBlacklist()
          } else {
            return true
          }
        }
      },
      onlyHasPlatform (): boolean {
        return this.requires == null && !this.roleWhitelist.length && !this.roleBlacklist.length
      },
      whitelistLower (): string[] {
        return this.roleWhitelist.map(r => r.toLowerCase())
      },
      blacklistLower (): string[] {
        return this.roleBlacklist.map(r => r.toLowerCase())
      },
      userInWhitelist (): boolean {
        if (!this.roleWhitelist.length) return false
        let role = this.global.user.role.toLowerCase()
        return this.isInList(this.whitelistLower, role)
      },
      userInBlacklist (): boolean {
        if (!this.roleBlacklist.length) return false
        let role = this.global.user.role.toLowerCase()
        return this.isInList(this.blacklistLower, role)
      }
    },
    methods: {
      isInList (list, val): boolean {
        if (Array.isArray(list)) {
          return list.indexOf(val) > -1
        } else {
          return val === list
        }
      }
    },
    render (): VNode[] | VNode {
      return this.isVisible ? this.$slots.default : null
    }
  })
</script>

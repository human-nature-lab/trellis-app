<script lang="ts">
/**
   * This component uses a render function to avoid the limitations of templates. Templates cannot have slots as the root
   * and, thus, don't allow us to selectively show or hide a component without altering the DOM by adding an unnecessary.
   */
import PermissionMixin from '../mixins/PermissionMixin'
import Vue, { VNode } from 'vue'
import { TrellisPermission } from '../static/permissions.base'

export default Vue.extend({
  name: 'Permission',
  mixins: [PermissionMixin],
  props: {
    allowedRoles: {
      type: Array as () => string[],
      default: () => [],
    },
    blockedRoles: {
      type: Array as () => string[],
      default: () => [],
    },
    requires: Number as () => TrellisPermission,
    webOnly: {
      type: Boolean,
      default: false,
    },
    mobileOnly: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isVisible: {
      cache: false,
      get (): boolean {
        const isCorrectPlatform = (this.webOnly !== false && this.isWeb) ||
          (this.mobileOnly !== false && this.isCordova)
        if (!isCorrectPlatform) {
          return false
        }
        const isUserLoaded = this.global && !!this.global.user
        if (isCorrectPlatform && this.onlyHasPlatform) {
          return true
        } else if (!isUserLoaded) {
          return false
        } else if (this.requires != null) {
          return this.hasPermission(this.requires)
        } else if (this.allowedRoles.length) {
          return this.userInAllowedList
        } else if (this.blockedRoles.length) {
          return !this.userInBlockedList
        } else {
          return true
        }
      },
    },
    onlyHasPlatform (): boolean {
      return this.requires == null && !this.allowedRoles.length && !this.blockedRoles.length
    },
    allowedLower (): string[] {
      return this.allowedRoles.map(r => r.toLowerCase())
    },
    blockedLower (): string[] {
      return this.blockedRoles.map(r => r.toLowerCase())
    },
    userInAllowedList (): boolean {
      if (!this.allowedRoles.length) return false
      const role = this.global.user.roleId.toLowerCase()
      return this.isInList(this.allowedLower, role)
    },
    userInBlockedList (): boolean {
      if (!this.blockedRoles.length) return false
      const role = this.global.user.roleId.toLowerCase()
      return this.isInList(this.blockedLower, role)
    },
  },
  methods: {
    isInList (list, val): boolean {
      if (Array.isArray(list)) {
        return list.indexOf(val) > -1
      } else {
        return val === list
      }
    },
  },
  render (): VNode[] | VNode {
    return this.isVisible ? this.$slots.default : null
  },
})
</script>

<script lang="ts">
  /**
   * This component uses a render function to avoid the limitations of templates. Templates cannot have slots as the root
   * and, thus, don't allow us to selectively show or hide a component without altering the DOM by adding an unnecessary.
   */
  import PermissionMixin from "../mixins/PermissionMixin"
  import Vue from 'vue'
  import {TrellisPermission} from "../static/permissions.base"
  export default Vue.extend({
    name: 'permission',
    mixins: [PermissionMixin],
    props: {
      roleWhitelist: {
        type: Array as () => string[],
        default: () => []
      },
      roleBlacklist: {
        default: () => []
      },
      requires: Number as () => TrellisPermission
    },
    computed: {
      isVisible (): boolean {
        if (!this.global || !this.global.user) return false
        if (this.requires) {
          return this.hasPermission(this.requires)
        } else if (this.roleWhitelist.length) {
          return this.userInWhitelist()
        } else {
          return !this.userInBlacklist()
        }
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
      isInList (list, val) {
        if (Array.isArray(list)) {
          return list.indexOf(val) > -1
        } else {
          return val === list
        }
      }
    },
    render () {
      return this.isVisible ? this.$slots.default : null
    }
  })
</script>

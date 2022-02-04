import PermissionService from '../services/permission'
import UserService from '../services/user/UserService'
import { TrellisPermission } from '../static/permissions.base'
import global, {Singleton} from '../static/singleton'
import Vue from 'vue'

export default Vue.extend({
  props: {
    requires: Number as () => TrellisPermission
  },
  data () {
    return {
      global: global as Singleton,
      userPermissions: PermissionService.userPermissions // This object is managed by the PermissionService
    }
  },
  async created () {
    if (this.global && !this.global.user) {
      try {
        const user = await UserService.loadCurrentUser()
        if (!this.global.user) {
          this.global.user = user
        }
      } catch (err) {}
    }
    await PermissionService.loadIfNotLoaded(this.global.user)
  },
  methods: {
    hasPermission (permissions: TrellisPermission|TrellisPermission[]): boolean {
      return PermissionService.hasPermission(this.userPermissions, permissions)
    },
    hasRole (roles: string|string[]): boolean {
      if (!Array.isArray(roles)) {
        roles = [roles]
      }
      if (!roles.length || !this.global || !this.global.user || !this.global.user.role || typeof this.global.user.role !== 'string') return false
      let role = this.global.user.role.toLowerCase()
      return roles.map(r => r.toLowerCase()).indexOf(role) !== -1
    },
    notInRole (roles: string[]): boolean {
      return !this.hasRole(roles)
    }
  },
  computed: {
    isTestStudy (): boolean {
      return !!this.global.study && !this.global.study.testStudyId
    }
  }
})

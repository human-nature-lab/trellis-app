import PermissionService from "../services/permission";
import UserService from '../services/user/UserService'
import {TrellisPermission} from "../static/permissions.base";
import global, {Singleton} from '../static/singleton'
import Vue from 'vue'

export default Vue.extend({
  data () {
    return {
      global: global as Singleton,
      permissions: PermissionService.userPermissions // This object is managed by the PermissionService
    }
  },
  async created () {
    if (this.global && !this.global.user) {
      const user = await UserService.loadCurrentUser()
      if (!this.global.user) {
        this.global.user = user
      }
    }
    await PermissionService.loadIfNotLoaded(this.global.user)
  },
  methods: {
    hasPermission (permission: TrellisPermission): boolean {
      return this.permissions[permission]
    },
    hasRole (roles: string|string[]): boolean {
      if (!Array.isArray(roles)) {
        roles = [roles]
      }
      if (!roles.length || !this.global.user || !this.global.user.role) return false
      let role = this.global.user.role.toLowerCase()
      return roles.map(r => r.toLowerCase()).indexOf(role) !== -1
    },
    notInRole (roles: string[]): boolean {
      return !this.hasRole(roles)
    }
  }
})
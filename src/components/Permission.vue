<template functional>
  <span v-if="isVisible">
    <slot></slot>
  </span>
</template>

<script>
  import UserService from '../services/user/UserService'
  export default {
    name: 'permission',
    props: {
      roleWhitelist: {
        default: () => []
      },
      roleBlacklist: {
        default: () => []
      }
    },
    created () {
      UserService.loadCurrentUser() // Just make sure we load the user on any page where the permission component is used
    },
    computed: {
      isVisible () {
        if (this.roleWhitelist.length) {
          return this.userInWhitelist()
        } else {
          return !this.userInBlacklist()
        }
      }
    },
    data () {
      return {
        whitelist_: this.roleWhitelist.map(r => r.toLowerCase()),
        blacklist_: this.roleBlacklist.map(r => r.toLowerCase())
      }
    },
    methods: {
      isInList (list, val) {
        if (Array.isArray(list)) {
          return list.indexOf(val) > -1
        } else {
          return val === list
        }
      },
      userInWhitelist () {
        if (!this.roleWhitelist.length) return false
        let role = UserService.getCurrentUser().role.toLowerCase()
        return this.isInList(this.whitelist_, role)
      },
      userInBlacklist () {
        if (!this.roleBlacklist.length) return false
        let role = UserService.getCurrentUser().role.toLowerCase()
        this.isInList(this.blacklist_, role)
      }
    }
  }
</script>

<template>
  <tr>
    <td>{{permission.id}}</td>
    <td>{{permission.type}}</td>
    <td v-for="rolePermission in rolePermissions">
      <TrellisLoadingCircle v-if="rolePermission.isWorking" size="25px" />
      <v-checkbox
        v-else
        v-model="rolePermission.value"
        :disabled="rolePermission.roleId === 'admin' || !hasPermission(TrellisPermission.EDIT_PERMISSIONS)"
        @change="updateRolePermission(rolePermission)" />
    </td>
  </tr>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Permission from '../../entities/trellis/Permission'
  import Role from '../../entities/trellis/Role'
  import RolePermission from '../../entities/trellis/RolePermission'
  import PermissionMixin from '../../mixins/PermissionMixin'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'
  import PermissionService from '../../services/permission'

  interface RolePermissionLoad extends RolePermission {
    isWorking: boolean
  }

  export default Vue.extend({
    name: 'PermissionRow',
    mixins: [ PermissionMixin ],
    components: { TrellisLoadingCircle },
    props: {
      permission: {
        type: Object as () => Permission,
        required: true
      },
      roles: {
        type: Array as () => Role[],
        required: true
      }
    },
    computed: {
      rolePermissions (): RolePermissionLoad[] {
        return this.roles.map(r => {
          const existing = r.permissions.find(p => p.roleId === r.id && p.permissionId === this.permission.id) as RolePermissionLoad
          let p = existing
          if (!existing || r.id.toLowerCase() === 'admin') {
            p = (new RolePermission()) as RolePermissionLoad
            p.roleId = r.id
            p.permissionId = this.permission.id
            p.value = r.id.toLowerCase() === 'admin'
          }
          p.isWorking = false
          return p
        })
      }
    },
    methods: {
      async updateRolePermission (rolePermission: RolePermissionLoad) {
        try {
          rolePermission.isWorking = true
          const newRolePermission = await PermissionService.updateRolePermission(rolePermission)
          this.$emit('newRolePermission', newRolePermission)
          this.alert('success', this.$t('resource_updated', [rolePermission.permissionId]))
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_update', [rolePermission.permissionId]), { timeout: 0 })
        } finally {
          rolePermission.isWorking = false
        }
      }
    }
  })
</script>

<style lang="sass" scoped>

</style>

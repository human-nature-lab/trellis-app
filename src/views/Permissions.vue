<template>
  <v-flex>
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>
          {{$t('permissions')}}
        </v-toolbar-title>
        <v-spacer />
        <v-text-field
          v-model="query.live"
          :label="$t('search')"
          @change="debounceModel('query.debounce', 500)" />
        <v-tooltip left>
          <v-btn slot="activator" icon @click="showRoleDialog = true">
            <v-icon>add</v-icon>
          </v-btn>
          <span>Create a new role</span>
        </v-tooltip>
      </v-toolbar>
      <v-progress-linear :active="isLoading" indeterminate :height="3" />
      <v-data-table
        hide-actions
        :items="filteredPermissions">
        <template slot="headers" slot-scope="props">
          <tr>
            <th>{{$t('permission')}}</th>
            <th>{{$t('type')}}</th>
            <th v-for="role in roles">
              {{role.name}}
              <v-menu
                lazy
                :disabled="isLoading">
                <v-btn
                  slot="activator"
                  icon>
                  <v-icon>more_vert</v-icon>
                </v-btn>
                <v-list>
                  <v-list-tile
                    v-if="role.canDelete"
                    :disabled="!hasPermission(TrellisPermission.EDIT_PERMISSIONS)"
                    @click="removeRole(role)">
                    <v-list-tile-action>
                      <v-icon color="error">delete</v-icon>
                    </v-list-tile-action>
                    {{$t('delete') | TitleCase}}
                  </v-list-tile>
                  <v-list-tile
                    @click="startCopy(role)"
                    :disabled="!hasPermission(TrellisPermission.EDIT_PERMISSIONS)">
                    <v-list-tile-action>
                      <v-icon>chevron_right</v-icon>
                    </v-list-tile-action>
                    {{$t('copy') | TitleCase}}
                  </v-list-tile>
                </v-list>
              </v-menu>
            </th>
          </tr>
        </template>
        <PermissionRow
          slot="items"
          slot-scope="{item: permission}"
          @newRolePermission="newRolePermission"
          :permission="permission"
          :roles="roles" />
      </v-data-table>
    </v-card>
    <TrellisModal
      v-model="showRoleDialog"
      :title="$t('add_role')">
      <NewRoleForm @save="addRole"/>
    </TrellisModal>
    <TrellisModal
      v-model="copy.isActive"
      :title="$t('copy_role')">
      <v-select
        v-model="copy.toRole"
        :label="$t('role')"
        :items="copyToRoles"
        item-text="name" />
      <v-btn @click="finishCopy" :disabled="!copy.toRole">
        {{$t('copy')}}
      </v-btn>
    </TrellisModal>
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'
  import NewRoleForm from '../components/permissions/NewRoleForm.vue'
  import PermissionRow from '../components/permissions/PermissionRow.vue'
  import TrellisModal from '../components/TrellisModal.vue'
  import Permission from '../entities/trellis/Permission'
  import Role from '../entities/trellis/Role'
  import RolePermission from '../entities/trellis/RolePermission'
  import TitleCase from '../filters/TitleCase'
  import DebounceMixin from '../mixins/DebounceMixin'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'
  import PermissionMixin from '../mixins/PermissionMixin'
  import RoleService from '../services/role'
  import PermissionService from '../services/permission'

  export default Vue.extend({
    name: 'Permissions',
    mixins: [ PermissionMixin, DebounceMixin, DocsLinkMixin('./Permissions.md') ],
    components: { PermissionRow, TrellisModal, NewRoleForm },
    data () {
      return {
        isLoading: true,
        showRoleDialog: false,
        roles: [],
        permissions: [],
        query: {
          live: null,
          debounced: null
        },
        copy: {
          isActive: false,
          fromRole: null as Role,
          toRole: null as Role
        }
      }
    },
    filters: {
      TitleCase
    },
    created () {
      this.loadPermissions()
    },
    computed: {
      headers (): object[] {
        return [{text: this.$t('permission'), value: 'id'}, {text: this.$t('type'), value: 'type'}].concat(this.roles.map(r => ({
          text: r.name,
          value: r.id,
          sortable: false
        })))
      },
      copyToRoles (): Role[] {
        return this.roles.filter(r => r.canEdit && this.copy.fromRole && r.id !== this.copy.fromRole.id)
      },
      filteredPermissions (): Permission[] {
        if (!this.query || !this.query.live) return this.permissions
        const q = this.query.live.toUpperCase()
        return this.permissions.filter(p => {
          return !this.query.live || p.id.toUpperCase().indexOf(q) > -1 || p.type.toUpperCase().indexOf(q) > -1
        })
      }
    },
    methods: {
      async loadPermissions () {
        this.isLoading = true
        const res = await PermissionService.all()
        this.permissions = res.all
        this.roles = res.roles
        this.isLoading = false
      },
      async addRole (role: Role) {
        try {
          const newRole = await RoleService.create(role)
          this.roles.push(newRole)
          this.alert('success', this.$t('resource_created', [role.name]))
          this.showRoleDialog = false
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_create', [role.name]), { timeout: 0 })
        }
      },
      async removeRole (role: Role) {
        if (!confirm(this.$t('remove_confirm', [role.name]) as string)) return
        try {
          await RoleService.remove(role.id)
          const index = this.roles.findIndex(r => r.id === role.id)
          this.roles.splice(index, 1)
          this.alert('success', this.$t('resource_deleted', [role.name]))
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_delete', [role.name]), { timeout: 0 })
        }
      },
      newRolePermission (rolePermission: RolePermission) {
        const role = this.roles.find(r => r.id === rolePermission.roleId)
        if (role) {
          const index = role.permissions.findIndex(rp => rp.permissionId === rolePermission.permissionId)
          if (index > -1) {
            role.permissions.splice(index, 1, rolePermission)
          } else {
            role.permissions.push(rolePermission)
          }
        }
      },
      startCopy (role: Role) {
        this.copy.isActive = true
        this.copy.fromRole = role
        this.copy.toRole = null
      },
      async finishCopy () {
        if (!confirm(this.$t('confirm_copy_role', [this.copy.fromRole.name, this.copy.toRole.name]) as string)) return
        try {
          this.isLoading = true
          const newRole = await RoleService.copyPermissions(this.copy.fromRole, this.copy.toRole)
          let index = this.roles.findIndex(r => r.id === newRole.id)
          if (index > -1) {
            this.roles.splice(index, 1, newRole)
          }
          this.copy.isActive = false
          this.alert('success', this.$t('resource_updated', [newRole.name]))
        } catch (err) {
          this.log(err)
          this.alert('error', this.$t('failed_resource_update', [this.copy.toRole.name]), {timeout: 0})
        } finally {
          this.isLoading = false
        }
      }
    }
  })
</script>
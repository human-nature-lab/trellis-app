<template>
  <v-flex xs12>
    <v-container>
      <v-toolbar flat>
        <v-toolbar-title>
          {{$t('users')}}
        </v-toolbar-title>
        <v-spacer />
        <Permission :requires="TrellisPermission.ADD_USER">
          <v-btn
            icon
            @click="userToEdit = null; showEditUser = true">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </Permission>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="users"
        :loading="isLoading"
        :options="pagination"
        @update:options="loadUsers($event)"
        :footer-props="footerProps"
        :server-items-length="total">
        <template v-slot:item="{ item }">
          <UserRow
            :user="item"
            @edit="editUser(item)"
            @remove="removeUser(item)" />
        </template>
      </v-data-table>
    </v-container>
    <TrellisModal
      v-model="showEditUser"
      :title="!userToEdit ? $t('new_user_title') : $t('edit_user_title', [userToEdit.name])">
      <UserEdit
        :user="userToEdit"
        @save="saveUser" />
    </TrellisModal>
  </v-flex>
</template>

<script lang="ts">
  import Permission from '../components/Permission.vue'
  import User from '../entities/trellis/User'
  import UserEdit from '../components/user/UserEdit.vue'
  import UserRow from '../components/user/UserRow.vue'
  import UserService from '../services/user'
  import TrellisModal from '../components/TrellisModal.vue'
  import Vue from 'vue'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'
  import IsAdminMixin from '../mixins/IsAdminMixin'
  import DocsFiles from '../components/documentation/DocsFiles'

  export default Vue.extend({
    name: 'Users',
    components: { UserRow, UserEdit, TrellisModal, Permission },
    mixins: [DocsLinkMixin(DocsFiles.users.intro), IsAdminMixin],
    data () {
      return {
        users: [],
        total: 25,
        showEditUser: false,
        userToEdit: null,
        isLoading: false,
        pagination: {
          page: 1,
          itemsPerPage: 20,
          sortBy: ['name'],
          sortDesc: false
        },
        footerProps: {
          itemsPerPageAllText: this.$t('all'),
          itemsPerPageOptions: [20, 50, 100, -1],
          itemsPerPageText: this.$t('rows_per_page'),
        }
      }
    },
    created () {
      this.loadUsers(this.pagination)
    },
    computed: {
      headers (): object[] {
        return [{
          text: this.$t('actions'),
          sortable: false
        }, {
          text: this.$t('name'),
          value: 'name'
        }, {
          text: this.$t('username'),
          value: 'username'
        }, {
          text: this.$t('role'),
          value: 'role'
        }, {
          text: this.$t('studies'),
          sortable: false
        }]
      }
    },
    methods: {
      async editUser (user: User) {
        this.showEditUser = true
        this.userToEdit = user
      },
      async loadUsers (pagination) {
        console.log('loadUsers', pagination)
        try {
          this.isLoading = true
          this.pagination = pagination
          const page = await UserService.getPage(pagination.page - 1, pagination.itemsPerPage, pagination.sortBy[0], pagination.sortDesc)
          this.total = page.total
          this.users = page.data
          console.log('users', this.users)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Unable to load users')
          }
        } finally {
          this.isLoading = false
        }
      },
      async removeUser (user: User) {
        if (confirm(this.$t('confirm_resource_delete', [user.name]) as string + ' ' + this.$t('cannot_undo'))) {
          try {
            this.isLoading = true
            await UserService.deleteUser(user.id)
            const index = this.users.indexOf(user)
            if (index > -1) {
              this.users.splice(index, 1)
            }
            this.alert('success', this.$t('resource_deleted', [user.name]))
          } catch (err) {
            if (this.isNotAuthError(err)) {
              this.logError(err, this.$t('failed_resource_delete', [user.name]))
            }
          } finally {
            this.isLoading = false
          }
        }
      },
      async createUser (user: User) {
        try {
          this.isLoading = true
          user = await UserService.createUser(user)
          this.users.push(user)
          this.alert('success', this.$t('resource_created', [user.name]))
          this.showEditUser = false
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, this.$t('failed_resource_create', [user.name]))
          }
        } finally {
          this.isLoading = false
        }
      },
      async updateUser (user: User) {
        try {
          this.isLoading = true
          user = await UserService.updateUser(user)
          const index = this.users.findIndex(u => user.id === u.id)
          this.users.splice(index, 1, user)
          this.alert('success', this.$t('resource_updated', [user.name]))
          this.showEditUser = false
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, this.$t('failed_resource_update', [user.name]))
          }
        } finally {
          this.isLoading = false
        }
      },
      async saveUser (user: User) {
          if (user.id) {
            this.updateUser(user)
          } else {
            this.createUser(user)
          }
      }
    }
  })
</script>

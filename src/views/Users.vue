<template>
  <v-flex>
    <v-container>
      <v-toolbar flat>
        <v-toolbar-title>
          {{$t('users')}}
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          :disabled="!canAddUser"
          icon
          @click="userToEdit = null; showEditUser = true">
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="users"
        :pagination.sync="pagination"
        class="elevation-1">
        <UserRow
          slot="items"
          slot-scope="props"
          :user="props.item"
          @edit="editUser(props.item)"
          @delete="deleteUser(props.item)" />
      </v-data-table>
    </v-container>
    <v-dialog v-model="showEditUser" lazy>
      <v-card>
        <v-container>
          <UserEdit :user="userToEdit" @save="saveUser" />
        </v-container>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script lang="ts">
  import User from '../entities/Trellis/User'
  import UserEdit from '../components/user/UserEdit'
  import UserRow from '../components/user/UserRow'
  import {Route} from 'vue-router/types/router'
  import UserService from '../services/user/UserService'
  import Vue from 'vue'
  import RoutePreloadMixin from "../mixins/RoutePreloadMixin"
  import DocsLinkMixin from "../mixins/DocsLinkMixin"
  import DocsFiles from "../components/documentation/DocsFiles"
  import Role from "../components/user/Role"
  import global from '../static/singleton'

  async function loadUsers (to: Route, from: Route) {
    const page = to.query.page || 0
    return UserService.getPage(page)
  }

  export default Vue.extend({
    name: 'Users',
    components: {UserRow, UserEdit},
    computed: {
      canAddUser (): boolean {
        return !!this.global.user && this.global.user.role === Role.ADMIN
      },
      headers () {
        return [{
          text: 'Name',
          value: 'name'
        }, {
          text: 'Username',
          value: 'username'
        }, {
          text: 'Role',
          value: 'role'
        }, {
          text: 'Studies',
          sortable: false
        }, {
          text: 'Actions',
          sortable: false,
          align: 'right'
        }]
      }
    },
    data () {
      return {
        global,
        users: null,
        showEditUser: false,
        userToEdit: null,
        pagination: {
          descending: false,
          page: 1,
          rowsPerPage: 100,
          sortBy: 'name'
        }
      }
    },
    mixins: [RoutePreloadMixin(loadUsers), DocsLinkMixin(DocsFiles.users.intro)],
    methods: {
      hydrate (users: User[]) {
        console.log('users', users)
        this.users = users
      },
      async editUser (user: User) {
        this.showEditUser = true
        this.userToEdit = user
      },
      async deleteUser (user: User) {
        if (confirm(this.$t('delete_user') as string)) {
          try {
            await UserService.deleteUser(user.id)
            const index = this.users.indexOf(user)
            if (index > -1) {
              this.users.splice(index, 1)
            }
            this.alert('success', this.$t('user_deleted'))
          } catch (err) {
            this.alert('error', this.$t('delete_user_failed'))
          }
        }
      },
      async saveUser (user: User) {
        try {
          if (user.id) {
            user = await UserService.updateUser(user)
            const index = this.users.findIndex(u => user.id === u.id)
            this.users.splice(index, 1, user)
          } else {
            user = await UserService.createUser(user)
            this.users.push(user)
          }
          this.alert('success', this.$t('user_updated'))
          this.showEditUser = false
        } catch (err) {
          this.alert('error', this.$t('user_update_error'))
        }
      }
    }
  })
</script>

<style scoped>

</style>

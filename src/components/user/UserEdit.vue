<template>
  <v-form ref="form" v-model="formIsValid">
    <v-text-field
      v-model="newUser.name"
      :rules="nameRules"
      required
      :label="$t('name')" />
    <v-text-field
      v-model="newUser.username"
      :rules="usernameRules"
      required
      :label="$t('username')" />
    <v-select
      v-model="newUser.roleId"
      :items="roles"
      item-text="name"
      item-value="id"
      :loading="isLoading"
      required
      :label="$t('role')"/>
    <PasswordField
      v-if="isNewUser"
      v-model="newUser.password" />
    <v-flex>
      <v-btn @click="save" :disabled="!canSave()">
        {{$t('save')}}
      </v-btn>
      <v-btn
        :disabled="!canChangePassword"
        @click="passwordModal = true">
        {{$t('change_password')}}
      </v-btn>
    </v-flex>
    <TrellisModal
      v-model="passwordModal"
      :title="$t('change_password')">
      <UserPassword :user="user" />
    </TrellisModal>
  </v-form>
</template>

<script lang="ts">
  import Vue from 'vue'
  import User from '../../entities/trellis/User'
  import PermissionMixin from '../../mixins/PermissionMixin'
  import ValidationMixin from '../../mixins/ValidationMixin'
  import DiffService from '../../services/DiffService'
  import { TrellisPermission, TrellisRole } from '../../static/permissions.base'
  import TrellisModal from '../TrellisModal.vue'
  import UserPassword from './UserPassword.vue'
  import global from '../../static/singleton'
  import PasswordField from './PasswordField.vue'
  import IsAdminMixin from '../../mixins/IsAdminMixin'
  import RoleService from '../../services/role'

  interface UserLike {
    id?: string
    password?: string
    name: string
    username: string
    roleId: string
  }

  const defaultUser = new User().fromSnakeJSON({
    id: null,
    password: null,
    name: '',
    username: '',
    role_id: null
  })

  export default Vue.extend({
    name: 'UserEditModal',
    mixins: [ IsAdminMixin, PermissionMixin, ValidationMixin ],
    components: { UserPassword, PasswordField, TrellisModal },
    props: {
      user: Object as () => User
    },
    data () {
      return {
        global: global,
        formIsValid: false as boolean,
        usernameRules: [this.required(), this.minLength(3)],
        nameRules: [this.required(), this.minLength(3)],
        passwordModal: false,
        isLoading: false,
        roles: [],
        newUser: this.user ? this.user.copy() : defaultUser.copy()
      }
    },
    created () {
      this.userChange(this.user)
      this.loadRoles()
    },
    computed: {
      hasChanges (): boolean {
        return !DiffService.objectsAreEqualByProps(this.user, this.newUser, ['name', 'username', 'roleId'])
      },
      isSameUser (): boolean {
        return !!this.global.user && !!this.newUser && this.global.user.id === this.newUser.id
      },
      isNewUser (): boolean {
        return !this.newUser || !this.newUser.id
      },
      canChangePassword (): boolean {
        // If we're editing our own password
        if (!!this.newUser && !!this.global.user && this.newUser.id === this.global.user.id) {
          return true
        } else if (this.hasPermission(TrellisPermission.EDIT_PASSWORDS)) {
          return true
        }
        return false
      }
    },
    watch: {
      user: {
        handler (newUser): void {
          this.userChange(newUser)
        }
      }
    },
    methods: {
      async loadRoles (): Promise<void> {
        try {
          this.isLoading = true
          this.roles = await RoleService.all()
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Unable to load roles')
          }
        } finally {
          this.isLoading = false
        }
      },
      canSave (): boolean {
        return this.formIsValid && this.hasChanges
      },
      userChange (newUser): void {
        for (let key in this.newUser) {
          this.newUser[key] = newUser ? newUser[key] : defaultUser[key]
        }
      },
      async save (): Promise<void> {
        // @ts-ignore
        if (this.canSave && this.$refs.form.validate()) {
          this.$emit('save', this.newUser)
        }
      }
    }
  })
</script>

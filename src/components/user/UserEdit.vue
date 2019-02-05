<template>
  <v-form ref="form" v-model="formIsValid">
    <v-text-field
      v-model="newUser.name"
      :rules="nameRules"
      required
      :disabled="!isAdmin"
      :label="$t('name')" />
    <v-text-field
      v-model="newUser.username"
      :rules="usernameRules"
      required
      :disabled="!isAdmin"
      :label="$t('username')" />
    <v-select
      v-model="newUser.role"
      :items="roles"
      required
      :disabled="!isAdmin"
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
  import User from "../../entities/trellis/User"
  import TrellisModal from "../TrellisModal"
  import UserPassword from './UserPassword'
  import global from '../../static/singleton'
  import PasswordField from './PasswordField'
  import Role from "./Role"
  import IsAdminMixin from "../../mixins/IsAdminMixin"

  interface UserLike {
    id?: string
    password?: string
    name: string
    username: string
    role: string
  }

  const defaultUser = {
    id: null,
    password: null,
    name: '',
    username: '',
    role: Role.SURVEYOR
  }

  export default Vue.extend({
    name: 'UserEditModal',
    mixins: [ IsAdminMixin ],
    components: { UserPassword, PasswordField, TrellisModal },
    created () {
      this.userChange(this.user)
    },
    computed: {
      hasChanges (): boolean {
        let r = false
        for (let key of ['name', 'username', 'role']) {
          if (this.user) {
            if (this.newUser[key] !== this.user[key]) {
              r = true
              break
            }
          } else {
            if (this.newUser[key].length) {
              r = true
              break
            }
          }
        }
        return r
      },
      nameRules (): Function[] {
        return [() => !!this.newUser.name.length || this.$t('empty_value')]
      },
      usernameRules (): Function[] {
        return [] // TODO: Verify that there aren't special characters
      },
      isSameUser (): boolean {
        return !!this.global.user && !!this.newUser && this.global.user.id === this.newUser.id
      },
      isNewUser (): boolean {
        return !this.newUser || !this.newUser.id
      },
      canChangePassword (): boolean {
        // @ts-ignore
        const r = this.isAdmin || (!!this.newUser && !!this.global.user && this.newUser.id === this.global.user.id)
        console.log('can change password', r)
        return r
      }
    },
    watch: {
      user: {
        handler (newUser): void {
          this.userChange(newUser)
        },
        deep: true
      }
    },
    data () {
      return {
        global: global,
        formIsValid: false as boolean,
        passwordModal: false,
        roles: Object.keys(Role),
        newUser: this.user ? {
          id: this.user.id,
          name: this.user.name,
          username: this.user.username,
          password: this.user.password,
          role: this.user.role
        } : Object.assign({}, defaultUser) as UserLike
      }
    },
    props: {
      user: Object as () => User
    },
    methods: {
      canSave (): boolean {
        return this.formIsValid && this.hasChanges
      },
      userChange (newUser) {
        for (let key in this.newUser) {
          this.newUser[key] = newUser ? newUser[key] : defaultUser[key]
        }
      },
      async save () {
        // @ts-ignore
        if (this.canSave && this.$refs.form.validate()) {
          this.$emit('save', this.newUser)
        }
      }
    }
  })
</script>

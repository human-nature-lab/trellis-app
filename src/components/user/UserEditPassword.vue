<template>
  <v-form ref="form" v-model="formValid" lazy-validation>
    <v-flex class="display-2">
      {{$t('change_password')}}
    </v-flex>
    <v-text-field
      v-if="(global.user && global.user.role !== 'ADMIN')"
      v-model="oldPassword"
      :append-icon="showOldPass ? 'visibility' : 'visibility_off'"
      :append-icon-cb="() => (showOldPass = !showOldPass)"
      :type="showOldPass ? 'text' : 'password'"
      :rules="oldPassRules"
      validate-on-blur
      :label="$t('old_password')" />
    <PasswordField v-model="newPassword" />
    <v-flex>
      <v-btn @click="save" :disabled="!formValid">{{$t('save')}}</v-btn>
    </v-flex>
  </v-form>
</template>

<script lang="ts">
  import global from '../../static/singleton'
  import User from "../../entities/trellis/User"
  import UserService from "../../services/user/UserService"
  import PasswordField from './PasswordField'
  import Vue from 'vue'
  import {Vue as VueType} from 'vue/types/vue'
  export default Vue.extend({
    name: 'UserEditPassword',
    components: {PasswordField},
    props: {
      user: Object as () => User
    },
    data () {
      return {
        global,
        formValid: false,
        showOldPass: false,
        showNewPass: false,
        oldPassword: '',
        newPassword: '',
        oldPassRules: [
          // @ts-ignore
          () => (!!this.oldPassword || this.$t('empty_value'))
        ]
      }
    },
    methods: {
      async save () {
        // @ts-ignore
        if (this.$refs.form.validate()) {
          try {
            const res = await UserService.updatePassword(this.user, this.oldPassword, this.newPassword)
            debugger
            this.alert('success', this.$t('password_updated'))
          } catch (err) {
            debugger
            this.alert('error', `Invalid password or permissions`)
          }
        }
      }
    }
  })
</script>

<style scoped>

</style>

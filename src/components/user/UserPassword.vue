<template>
  <v-form ref="form" v-model="formValid" lazy-validation>
    <v-text-field
      v-if="!hasPermission(TrellisPermission.EDIT_PASSWORDS)"
      v-model="oldPassword"
      :append-icon="showOldPass ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append="() => (showOldPass = !showOldPass)"
      :type="showOldPass ? 'text' : 'password'"
      :rules="oldPassRules"
      validate-on-blur
      :label="$t('old_password')" />
    <PasswordField v-model="newPassword" />
    <v-flex>
      <v-btn
        @click="save"
        :disabled="!formValid">
        {{$t('save')}}
      </v-btn>
    </v-flex>
  </v-form>
</template>

<script lang="ts">
  import PermissionMixin from '../../mixins/PermissionMixin'
  import global from '../../static/singleton'
  import User from '../../entities/trellis/User'
  import UserService from '../../services/user'
  import PasswordField from './PasswordField.vue'
  import Vue from 'vue'

  export default Vue.extend({
    name: 'UserPassword',
    components: { PasswordField },
    mixins: [PermissionMixin],
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
            const msg = this.$t('password_updated')
            this.alert('success', msg)
            this.$emit('done')
          } catch (err) {
            this.alert('error', `Invalid password or permissions`, {timeout: 0})
          }
        }
      }
    }
  })
</script>

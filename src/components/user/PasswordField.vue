<template>
  <v-flex>
    <v-text-field
      v-model="newPassword"
      :append-icon="showPassword ? 'visibility' : 'visibility_off'"
      @click:append="() => (showPassword = !showPassword)"
      validate-on-blur
      :rules="newPassRules"
      :type="showPassword ? 'text' : 'password'"
      :label="$t('new_password')" />
    <v-text-field
      v-if="!showPassword"
      v-model="newPasswordRepetition"
      :rules="newPassRepRules"
      type="password"
      :label="$t('new_password_repeated')" />
  </v-flex>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({
    name: 'PasswordField',
    props: {
      value: {
        type: String
      }
    },
    computed: {
      newPassword: {
        get (): string {
          return this.value || ''
        },
        set (val: string): void {
          this.$emit('input', val)
        }
      }
    },
    data () {
      return {
        showPassword: false,
        newPasswordRepetition: '',
        newPassRules: [
          // @ts-ignore
          () => (this.newPassword.length >= 8 || this.$t('invalid_password_length', [8]))
        ],
        newPassRepRules: [
          // @ts-ignore
          () => (this.newPassword === this.newPasswordRepetition || this.$t('passwords_dont_match'))
        ]
      }
    }
  })
</script>

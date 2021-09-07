<template>
  <v-form
    ref="form"
    v-model="isValid"
    @submit="login">
    <v-text-field
      name="username"
      :label="$t('username')"
      autocapitalize="off"
      autocorrect="off"
      :rules="rules.username"
      required
      autofocus
      @change="$emit('username', username)"
      @keyup.enter="login"
      v-model="username" />
    <v-text-field
      ref="passField"
      :label="$t('password')"
      autocapitalize="off"
      autocorrect="off"
      required
      :rules="rules.password"
      @keyup.enter="login"
      @change="$emit('password', password)"
      :append-icon="isPassHidden ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append="togglePassHidden"
      :type="isPassHidden ? 'password' : 'text'"
      v-model="password"/>
    <v-btn
      v-if="showLoginButton"
      @click="login"
      :loading="isWorking"
      :disabled="isWorking || !isValid">
      {{ $t('login') }}
    </v-btn>
  </v-form>
</template>

<script lang="ts">
  import Vue from 'vue'
  import TrellisLoadingCircle from '../TrellisLoadingCircle'
  export default Vue.extend({
    name: 'LoginForm',
    components: { TrellisLoadingCircle },
    props: {
      value: {
        type: Boolean,
        default: false
      },
      isWorking: {
        type: Boolean,
        default: false
      },
      showLoginButton: {
        type: Boolean,
        default: true
      },
      clearCredentials: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        isValid: this.value,
        isPassHidden: true,
        rules: {
          username: [
            v => !!v || this.$t('required_field')
          ],
          password: [
            v => !!v || this.$t('required_field')
          ]
        },
        username: '',
        password: ''
      }
    },
    watch: {
      isValid (newVal) {
        this.$emit('input', newVal)
      }
    },
    methods: {
      login () {
        if (this.isValid && this.$refs.form.validate()) {
          this.$emit('login', this.username.trim(), this.password.trim())
          if (this.clearCredentials) {
            this.username = ''
            this.password = ''
          }
        }
      },
      togglePassHidden () {
        this.isPassHidden = !this.isPassHidden
        if (this.$refs.passField) {
          this.$nextTick(() => {
            // @ts-ignore
            this.$refs.passField.focus()
          })
        }
      }
    }
  })
</script>

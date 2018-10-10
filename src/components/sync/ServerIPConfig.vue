<template>
  <v-container>
    <v-layout justify-space-around>
      <v-flex xs6>
        <h2>
          {{ $t('settings') }}
        </h2>
      </v-flex>
    </v-layout>
    <v-layout v-if="showError" justify-space-around>
      <v-alert>
        {{errorMessage}}
      </v-alert>
    </v-layout>
    <v-layout justify-space-around>
      <v-flex xs8>
        <v-form
          v-model="valid"
          ref="form"
          @submit="setIpAddress()">
          <v-text-field
            name="ipAddress"
            :label="$t('server_ip_address')"
            autocapitalize="off"
            autocorrect="off"
            required
            autofocus
            v-model="ipAddress">
          </v-text-field>
          <v-btn
            @click="setIpAddress()"
            :disabled="!valid">
            {{ $t('save') }}
          </v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import DatabaseService from '../../services/database/DatabaseService'
  export default {
    name: 'server-ip-config',
    data: function () {
      return {
        errorMessage: undefined,
        ipAddress: '',
        error: null,
        valid: false
      }
    },
    methods: {
      setIpAddress: async function () {
        this.errorMessage = undefined
        if (!this.$refs.form.validate()) return
        try {
          await DatabaseService.setServerIPAddress(this.ipAddress)
          this.$emit('server-ip-config-done')
        } catch (err) {
          this.errorMessage = err.message
        }
      },
      showError: function () {
        return (this.errorMessage !== undefined)
      }
    }
  }
</script>

<style lang="sass" scoped>
  h2
    margin-top: 30px
    text-align: center
</style>

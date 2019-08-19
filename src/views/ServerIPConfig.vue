<template>
  <v-container>
    <v-layout justify-space-around>
      <v-flex xs6>
        <h2>
          {{ $t('settings') }}
        </h2>
      </v-flex>
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
            :disabled="loading"
            required
            autofocus
            v-model="ipAddress">
          </v-text-field>
          <v-btn
            @click="setIpAddress()"
            :loading="loading"
            :disabled="!valid || loading">
            {{ $t('save') }}
          </v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { heartbeatInstance } from '../services/http/AxiosInstance'
  import DatabaseService from '../services/database/DatabaseService'
  import AlertService from '../services/AlertService'
  import router, { replaceWithNextOr } from '../router'
  import global from '../static/singleton'
  import DocsLinkMixin from '../mixins/DocsLinkMixin'

  export default {
    name: 'ServerIpConfig',
    mixins: [DocsLinkMixin('./admin/ServerIPConfig.md')],
    data: function () {
      return {
        loading: false,
        ipAddress: '',
        valid: false
      }
    },
    methods: {
      setIpAddress: async function () {
        if (!this.$refs.form.validate()) return
        try {
          this.loading = true
          let combinedAddress = constructCombinedAddress(this.ipAddress)
          const http = await heartbeatInstance(combinedAddress)
          await http.get(`heartbeat`)
          await DatabaseService.setServerIPAddress(combinedAddress)
          replaceWithNextOr(() => {
            router.replace({name: 'Home'})
          })
        } catch (err) {
          AlertService.addAlert(err)
        } finally {
          this.loading = false
        }
      }
    },
    beforeRouteUpdate (to, from, next) {
      global.loading.active = false
    }
  }

  function constructCombinedAddress(serverIP) {
    let re = /(((http(s?)):(\/?)(\/?))?)(.*)/
    let groups = serverIP.match(re)
    console.log('groups', groups)
    let protocol = groups[3]
    let address = groups[7]
    let combinedAddress = `https://${address}`
    if (protocol === 'http') {
      combinedAddress = `http://${address}`
    }
    console.log('combinedAddress', combinedAddress)
    return combinedAddress
  }
</script>

<style lang="sass" scoped>
  h2
    margin-top: 30px
    text-align: center
</style>

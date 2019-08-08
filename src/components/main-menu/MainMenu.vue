<template>
  <v-flex>
    <v-list dense>
      <v-toolbar flat>
        <v-btn icon @click="global.menuDrawer.open = false">
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <v-flex class="text-xs-right" v-if="isLoggedIn">
          {{ $t('logged_in_as', [global.user.username]) }}
        </v-flex>
      </v-toolbar>
      <template
        v-for="section in sections"
        v-if="section.showIf !== false">
        <v-divider :key="section.title + 'divider'"></v-divider>
        <v-list dense subheader :key="section.title + 'list'">
          <v-subheader v-if="section.title">
            {{ $t(section.title) }}
          </v-subheader>
          <v-divider v-if="section.title"></v-divider>
          <v-list-tile
            v-for="item in section.items"
            :key="item.title"
            v-if="item.showIf !== false"
            @click="(e) => item.click && item.click(e)"
            v-bind="{to: item.to ? item.to : null}">
            <v-list-tile-action>
              <v-icon :color="item.iconColor">{{item.icon}}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ $t(item.title) }}
              </v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action v-if="item.switchValue != null">
              <v-switch
                :color="item.switchColor"
                v-model="item.switchValue" />
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </template>
    </v-list>
    <TrellisModal
      v-model="showPasswordModal"
      :title="$t('change_password')">
      <UserPassword :user="global.user" @done="showPasswordModal = false" />
    </TrellisModal>
  </v-flex>
</template>

<script>
  import config from 'config'
  import menuBus from './MenuBus'
  import LoginService from '../../services/login'
  import router from '../../router'
  import SingletonService from '../../services/SingletonService'
  import storage from '../../services/StorageService'
  import global from '../../static/singleton'
  import { APP_ENV } from '../../static/constants'
  import UserPassword from '../user/UserPassword'
  import TrellisModal from '../TrellisModal'
  import IsAdminMixin from '../../mixins/IsAdminMixin'
  import IsLoggedInMixin from '../../mixins/IsLoggedInMixin'
  import GeoLocationService from '../../services/geolocation'
  import Vue from 'vue'
  import PermissionMixin from '../../mixins/PermissionMixin'
  import { TrellisPermission } from '../../static/permissions.base'

  export default {
    mixins: [ IsAdminMixin, IsLoggedInMixin, PermissionMixin],
    components: { UserPassword, TrellisModal},
    name: 'dropdown-menu',
    data: () => ({
      global,
      showPasswordModal: false
    }),
    methods: {
      refresh () {
        window.location.reload(true)
      },
      emit (eventName, ...args) {
        menuBus.$emit(eventName, ...args)
      },
      copyCurrentLocation () {
        try {
          navigator.clipboard.writeText(window.location.href).then(() => {
            this.log({
              severity: 'info',
              message: 'information'
            })
            this.log({
              severity: 'debug',
              message: 'debugging'
            })
            this.alert('success', 'Text copied to clipboard!', {color: 'info', top: true})
          }).catch(err => {
            this.log(err)
            this.alert('error', `Unable to copy to clipboard. ${window.location.href}`, {timeout: 0})
          })
        } catch (err) {
          this.log(err)
          this.alert('error', `Unable to copy to clipboard. ${window.location.href}`, {timeout: 0})
        }
      },
      async logout () {
        await LoginService.logout()
        router.push({name: 'Login', query: {to: router.currentRoute.fullPath}})
      },
      toggleDarkTheme () {
        SingletonService.setDarkTheme(!SingletonService.get('darkTheme'))
      },
      toggleBatterySaver () {
        this.global.cpuOptimized = !this.global.cpuOptimized
        if (this.global.cpuOptimized) {
          this.rippleDirective = Vue.directive('ripple')
          Vue.directive('ripple', {})
        } else {
          Vue.directive('ripple', this.rippleDirective)
        }
      },
      toggleGPSWatch () {
        this.global.watchGPS = !this.global.watchGPS
        if (this.global.watchGPS) {
          GeoLocationService.watchPosition()
        } else {
          GeoLocationService.clearWatch()
        }
      },
      toggleOffline () {
        let offline = !SingletonService.get('offline')
        storage.clear()
        SingletonService.setOnlineOffline(offline)
        setTimeout(() => this.refresh(), 50)
      },
      changePassword () {
        this.showPasswordModal = true
      }
    },
    computed: {
      isDebug () {
        return config.debug
      },
      isCordovaBuild () {
        return config.appEnv === APP_ENV.CORDOVA
      },
      isInterview () {
        return this.$route.name === 'Interview' || this.$route.name === 'InterviewPreview'
      },
      sections () {
        return [{
          items: [{
            title: 'respondents',
            icon: 'group',
            to: {name: 'RespondentsSearch'}
          }, {
            title: 'locations',
            icon: 'place',
            to: {name: 'GeoSearch'}
          }, {
            showIf: !this.global.offline,
            to: {name: 'SyncAdmin'},
            icon: 'sync',
            title: 'sync'
          }, {
            showIf: this.global.offline,
            to: {name: 'Sync'},
            icon: 'sync',
            title: 'sync'
          }]
        }, {
          title: 'admin',
          showIf: this.isWeb,
          items: [{
            to: {name: 'Users'},
            icon: 'recent_actors',
            title: 'users',
            showIf: this.hasPermission(TrellisPermission.VIEW_USERS)
          }, {
            to: {name: 'Forms'},
            icon: 'library_books',
            title: 'forms'
          }, {
            to: {name: 'Reports'},
            icon: 'save',
            title: 'reports',
            showIf: this.hasPermission(TrellisPermission.VIEW_REPORTS)
          }, {
            to: {name: 'Devices'},
            icon: 'devices',
            title: 'devices',
            showIf: this.hasPermission(TrellisPermission.VIEW_DEVICES)
          }, {
            to: {name: 'Studies'},
            icon: 'import_contacts',
            title: 'studies',
            showIf: this.hasPermission(TrellisPermission.VIEW_STUDIES)
          }, {
            to: {name: 'GeoTypes'},
            icon: 'edit_location',
            title: 'geo_types'
          }]
        }, {
          title: 'settings',
          items: [{
            to: {name: 'StudySelector', query: {to: this.$route.fullPath}},
            icon: 'assignment',
            title: 'change_study'
          }, {
            title: 'change_locale',
            icon: 'language',
            to: {name: 'locale', query: {to: this.$route.fullPath}}
          }, {
            click: this.toggleDarkTheme,
            icon: 'wb_sunny',
            title: 'toggle_dark',
            switchColor: 'green',
            iconColor: null,
            switchValue: this.global.darkTheme,
          }, {
            click: this.toggleBatterySaver,
            title: 'battery_saver',
            icon: 'battery_alert',
            switchColor: 'green',
            switchValue: this.global.cpuOptimized,
            showIf: this.isCordovaBuild
          }, {
            click: this.toggleGPSWatch,
            title: 'track_location',
            iconColor: this.global.watchGPS ? (this.global.gpsFixed ? 'green': 'yellow') : null,
            switchColor: this.global.watchGPS ? (this.global.gpsFixed ? 'green': 'yellow') : null,
            icon: this.global.watchGPS ? (this.global.gpsFixed ? 'gps_fixed' : 'gps_not_fixed') : 'gps_off',
            switchValue: this.global.watchGPS,
            showIf: this.isCordovaBuild
          }]
        }, {
          title: 'general',
          items: [{
            to: {name: 'Documentation'},
            icon: 'help',
            title: 'documentation'
          }, {
            to: {name: 'Info'},
            icon: 'info',
            title: 'information'
          }, {
            showIf: this.isInterview,
            click: () => this.emit('showConditionTags'),
            icon: 'local_offer',
            title: 'condition_tags'
          }, {
            showIf: this.isLoggedIn,
            click: this.logout,
            icon: 'exit_to_app',
            title: 'logout'
          }, {
            showIf: this.isLoggedIn,
            click: this.changePassword,
            icon: 'settings_backup_restore',
            title: 'change_password'
          }, {
            to: {name: 'ServerConfig'},
            icon: 'build',
            title: 'server_config',
            showIf: this.isWeb && this.hasPermission(TrellisPermission.VIEW_CONFIG)
          }, {
            to: {name: 'Permissions'},
            icon: 'lock',
            title: 'permissions',
            showIf: this.isWeb && this.hasPermission(TrellisPermission.VIEW_PERMISSIONS)
          }, {
            click: this.refresh,
            icon: 'refresh',
            title: 'refresh'
          }, {
            showIf: this.isDebug,
            to: { name: 'ServiceTesting' },
            icon: 'done_all',
            title: 'Service Testing'
          }]
        }]
      }
    }
  }
</script>

<style scoped>
  .list__tile__title {
    line-height: 30px;
  }

</style>

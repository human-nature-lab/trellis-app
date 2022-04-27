<template>
  <v-flex>
    <v-list dense>
      <v-toolbar flat>
        <v-btn
          icon
          @click="global.menuDrawer.open = false"
        >
          <v-icon>
            mdi-arrow-left
          </v-icon>
        </v-btn>
        <v-flex
          class="text-xs-right"
          v-if="isLoggedIn"
        >
          {{ $t('logged_in_as', [global.user.username]) }}
        </v-flex>
      </v-toolbar>
      <template
        v-for="section in sections"
        v-if="section.showIf !== false"
      >
        <v-divider :key="section.title + 'divider'" />
        <v-list
          dense
          subheader
          :key="section.title + 'list'"
        >
          <v-subheader v-if="section.title">
            {{ section.title }}
          </v-subheader>
          <v-divider v-if="section.title" />
          <v-list-item
            v-for="item in section.items"
            :key="item.title"
            v-if="item.showIf !== false"
            @click="(e) => item.click && item.click(e)"
            exact
            v-bind="{to: item.to ? item.to : null}"
          >
            <v-list-item-action>
              <v-icon :color="item.iconColor">
                {{ item.icon }}
              </v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.title }}
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action v-if="item.switchValue != null">
              <v-switch
                :color="item.switchColor"
                v-model="item.switchValue"
              />
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </template>
    </v-list>
    <TrellisModal
      v-model="showPasswordModal"
      :title="$t('change_password')"
    >
      <UserPassword
        :user="global.user"
        @done="showPasswordModal = false"
      />
    </TrellisModal>
  </v-flex>
</template>

<script>
import Vue from 'vue'
import config from '../../config'
import menuBus from './MenuBus'
import LoginService from '../../services/login'
import { routeQueue } from '../../router'
import SingletonService from '../../services/SingletonService'
import storage from '../../services/StorageService'
import global from '../../static/singleton'
import { APP_ENV } from '../../static/constants'
import UserPassword from '../user/UserPassword.vue'
import TrellisModal from '../TrellisModal.vue'
import IsAdminMixin from '../../mixins/IsAdminMixin'
import IsLoggedInMixin from '../../mixins/IsLoggedInMixin'
import GeoLocationService from '../../services/geolocation'
import PermissionMixin from '../../mixins/PermissionMixin'
import { TrellisPermission } from '../../static/permissions.base'
import StudyService from '../../services/study'

export default {
  mixins: [IsAdminMixin, IsLoggedInMixin, PermissionMixin],
  components: { UserPassword, TrellisModal },
  name: 'MainMenu',
  data: () => ({
    global,
    showPasswordModal: false,
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
            message: 'information',
          })
          this.log({
            severity: 'debug',
            message: 'debugging',
          })
          this.alert('success', 'Text copied to clipboard!', { color: 'info', top: true })
        }).catch(err => {
          this.log(err)
          this.alert('error', `Unable to copy to clipboard. ${window.location.href}`, { timeout: 0 })
        })
      } catch (err) {
        this.log(err)
        this.alert('error', `Unable to copy to clipboard. ${window.location.href}`, { timeout: 0 })
      }
    },
    async logout () {
      await LoginService.logout()
      routeQueue.redirect({ name: 'Login' })
    },
    toggleDarkTheme () {
      const isDark = SingletonService.get('darkTheme')
      this.$vuetify.theme.dark = !isDark
      SingletonService.setDarkTheme(!isDark)
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
      const offline = !SingletonService.get('offline')
      storage.clear()
      SingletonService.setOnlineOffline(offline)
      setTimeout(() => this.refresh(), 50)
    },
    async toggleTestMode () {
      if (this.isTestMode) {
        const study = await StudyService.getProdStudyFromTest(this.global.study.id)
        if (study) {
          SingletonService.setCurrentStudy(study)
        }
      } else {
        SingletonService.setCurrentStudy(this.global.study.testStudy)
      }
      setTimeout(() => this.refresh(), 50)
    },
    changePassword () {
      this.showPasswordModal = true
    },
    openStudySelector () {
      routeQueue.pushAndReturnToCurrent({ name: 'StudySelector' })
    },
    openLocaleSelector () {
      routeQueue.pushAndReturnToCurrent({ name: 'LocaleSelector' })
    },
  },
  computed: {
    isDebug () {
      return config.debug
    },
    isTestMode () {
      return !!this.global.study && !this.global.study.testStudy
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
          title: this.$t('respondents'),
          icon: 'mdi-account-group',
          to: { name: 'RespondentsSearch' },
        }, {
          title: this.$t('locations'),
          icon: 'mdi-map-marker',
          to: { name: 'GeoSearch' },
        }, {
          showIf: !this.global.offline,
          to: { name: 'SyncAdmin' },
          icon: 'mdi-sync',
          title: this.$t('sync'),
        }, {
          showIf: this.global.offline,
          to: { name: 'Sync' },
          icon: 'mdi-sync',
          title: this.$t('sync'),
        }],
      }, {
        title: this.$t('admin'),
        showIf: this.isWeb,
        items: [{
          to: { name: 'Home' },
          icon: 'mdi-chart-line',
          title: this.$t('dashboard'),
        }, {
          to: { name: 'Users' },
          icon: 'mdi-account-box-multiple',
          title: this.$t('users'),
          showIf: this.hasPermission(TrellisPermission.VIEW_USERS),
        }, {
          to: { name: 'Forms' },
          icon: 'mdi-form-select',
          title: this.$t('forms'),
        }, {
          to: { name: 'Reports' },
          icon: 'mdi-content-save',
          title: this.$t('reports'),
          showIf: this.hasPermission(TrellisPermission.VIEW_REPORTS),
        }, {
          to: { name: 'DataImport' },
          icon: 'mdi-upload',
          title: this.$t('data_import'),
          showIf: this.hasPermission(TrellisPermission.IMPORT_RESPONDENTS),
        }, {
          to: { name: 'Devices' },
          icon: 'mdi-cellphone-link',
          title: this.$t('devices'),
          showIf: this.hasPermission(TrellisPermission.VIEW_DEVICES),
        }, {
          to: { name: 'Studies' },
          icon: 'mdi-book-open-blank-variant',
          title: this.$t('studies'),
          showIf: this.hasPermission(TrellisPermission.VIEW_STUDIES),
        }, {
          to: { name: 'GeoTypes' },
          icon: 'mdi-map-plus',
          title: this.$t('geo_types'),
        }],
      }, {
        title: 'settings',
        items: [{
          click: this.openStudySelector,
          icon: 'mdi-clipboard-text',
          title: this.$t('change_study'),
        }, {
          click: this.openLocaleSelector,
          title: this.$t('change_locale'),
          icon: 'mdi-web',
        }, {
          showIf: !!this.global.study,
          click: this.toggleTestMode,
          icon: this.isTestMode ? 'mdi-test-tube' : 'mdi-test-tube-empty',
          title: this.$t('test_mode'),
          switchColor: 'yellow',
          iconColor: null,
          switchValue: this.isTestMode,
        }, {
          click: this.toggleDarkTheme,
          icon: 'mdi-theme-light-dark',
          title: this.$t('toggle_dark'),
          switchColor: 'green',
          iconColor: null,
          switchValue: this.global.darkTheme,
        }, {
          click: this.toggleBatterySaver,
          title: this.$t('battery_saver'),
          icon: 'mdi-battery-alert',
          switchColor: 'green',
          switchValue: this.global.cpuOptimized,
          showIf: this.isCordovaBuild,
        }, {
          click: this.toggleGPSWatch,
          title: this.$t('track_location'),
          iconColor: this.global.watchGPS ? (this.global.gpsFixed ? 'green' : 'yellow') : null,
          switchColor: this.global.watchGPS ? (this.global.gpsFixed ? 'green' : 'yellow') : null,
          icon: this.global.watchGPS
            ? (this.global.gpsFixed ? 'mdi-crosshairs-gps' : 'mdi-crosshairs')
            : 'mdi-crosshairs-question',
          switchValue: this.global.watchGPS,
          showIf: this.isCordovaBuild,
        }],
      }, {
        title: this.$t('general'),
        items: [{
          to: { path: '/documentation/' },
          icon: 'mdi-help-circle',
          title: this.$t('documentation'),
        }, {
          to: { name: 'Info' },
          icon: 'mdi-information',
          title: this.$t('information'),
        }, {
          showIf: this.isInterview,
          click: () => this.emit('showConditionTags'),
          icon: 'mdi-tag',
          title: this.$t('condition_tags'),
        }, {
          showIf: this.isLoggedIn,
          click: this.logout,
          icon: 'mdi-exit-to-app',
          title: this.$t('logout'),
        }, {
          showIf: this.isLoggedIn,
          click: this.changePassword,
          icon: 'mdi-backup-restore',
          title: this.$t('change_password'),
        }, {
          to: { name: 'ServerConfig' },
          icon: 'mdi-wrench',
          title: this.$t('server_config'),
          showIf: this.isWeb && this.hasPermission(TrellisPermission.VIEW_CONFIG),
        }, {
          to: { name: 'Permissions' },
          icon: 'mdi-lock',
          title: this.$t('permissions'),
          showIf: this.isWeb && this.hasPermission(TrellisPermission.VIEW_PERMISSIONS),
        }, {
          click: this.refresh,
          icon: 'mdi-refresh',
          title: this.$t('refresh_app'),
        }, {
          showIf: this.isDebug,
          to: { name: 'ServiceTesting' },
          icon: 'mdi-check-all',
          title: 'Service Testing',
        }],
      }]
    },
  },
}
</script>

<style scoped>
  .list__tile__title {
    line-height: 30px;
  }

</style>

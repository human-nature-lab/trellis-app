<script setup lang="ts">
import Vue, { computed, ref } from 'vue'
import config from '@/config'
import menuBus from './MenuBus'
import LoginService from '@/services/login'
import { routeQueue } from '@/router'
import SingletonService from '@/services/SingletonService'
import storage from '@/services/StorageService'
import global from '@/static/singleton'
import { APP_ENV } from '@/static/constants'
import UserPassword from '../user/UserPassword.vue'
import TrellisModal from '../TrellisModal.vue'
import GeoLocationService from '@/services/geolocation'
import { TrellisPermission } from '@/static/permissions.base'
import StudyService from '@/services/study'
import { extraModules } from '@/modules'
import { log, alert } from '@/helpers/log.helper'
import { useRoute } from 'vue-router/composables'
import { i18n } from '@/i18n'
import { userHasPermission } from '@/helpers/user.helper'
import { isLoggedIn, isWeb } from '@/helpers/singleton.helper'
import { useVuetify } from '@/plugins/vuetify'

const vuetify = useVuetify()
const route = useRoute()
const showPasswordModal = ref(false)
const showExtraModal = ref(false)
const checkpoint = ref(0)

const isDebug = computed(() => {
  return config.debug || DEV
})
const isTestMode = computed(() => {
  return !!global.study && !global.study.testStudy
})
const isCordovaBuild = computed(() => {
  return config.appEnv === APP_ENV.CORDOVA
})
const isInterview = computed(() => {
  return route.name === 'Interview' || route.name === 'InterviewPreview'
})
const enabledModules = computed(() => {
  console.log('extraModules changed', extraModules)
  return Object.values(extraModules).filter(m => m.enabled())
})
const extraModulesEnabled = computed(() => {
  return isCordovaBuild.value && enabledModules.value.length > 0
})

function copyCurrentLocation () {
  try {
    navigator.clipboard.writeText(window.location.href).then(() => {
      log({
        severity: 'info',
        message: 'information',
      })
      log({
        severity: 'debug',
        message: 'debugging',
      })
      alert('success', 'Text copied to clipboard!', { color: 'info', top: true })
    }).catch(err => {
      log(err)
      alert('error', `Unable to copy to clipboard. ${window.location.href}`, { timeout: 0 })
    })
  } catch (err) {
    log(err)
    alert('error', `Unable to copy to clipboard. ${window.location.href}`, { timeout: 0 })
  }
}

function refresh () {
  window.location.reload()
}
async function logout () {
  await LoginService.logout()
  routeQueue.redirect({ name: 'Login' })
}
function toggleDarkTheme () {
  const isDark = SingletonService.get('darkTheme')
  vuetify.theme.dark = !isDark
  SingletonService.setDarkTheme(!isDark)
}

let rippleDirective
function toggleBatterySaver () {
  global.cpuOptimized = !global.cpuOptimized
  if (global.cpuOptimized) {
    rippleDirective = Vue.directive('ripple')
    Vue.directive('ripple', {})
  } else {
    Vue.directive('ripple', rippleDirective)
  }
}
function toggleGPSWatch () {
  global.watchGPS = !global.watchGPS
  if (global.watchGPS) {
    GeoLocationService.watchPosition()
  } else {
    GeoLocationService.clearWatch()
  }
}
function toggleOffline () {
  const offline = !SingletonService.get('offline')
  storage.clear()
  SingletonService.setOnlineOffline(offline)
  setTimeout(() => refresh(), 50)
}
async function toggleTestMode () {
  if (isTestMode.value) {
    const study = await StudyService.getProdStudyFromTest(global.study.id)
    if (study) {
      SingletonService.setCurrentStudy(study)
    }
  } else {
    SingletonService.setCurrentStudy(global.study.testStudy)
  }
  setTimeout(() => refresh(), 50)
}
function changePassword () {
  showPasswordModal.value = true
}
function openStudySelector () {
  routeQueue.pushAndReturnToCurrent({ name: 'StudySelector' })
}
function openLocaleSelector () {
  routeQueue.pushAndReturnToCurrent({ name: 'LocaleSelector' })
}
function logCheckpoint () {
  console.log('TRELLIS CHECKPOINT:', checkpoint.value)
  checkpoint.value++
}

function emit (event, ...args) {
  menuBus.$emit(event, ...args)
}

const sections = computed(() => {
  return [{
    items: [{
      title: i18n.t('respondents'),
      icon: 'mdi-account-group',
      to: { name: 'RespondentsSearch' },
    }, {
      title: i18n.t('locations'),
      icon: 'mdi-map-marker',
      to: { name: 'GeoSearch' },
    }, {
      showIf: !global.offline,
      to: { name: 'SyncAdmin' },
      icon: 'mdi-sync',
      title: i18n.t('sync'),
    }, {
      showIf: global.offline,
      to: { name: 'Sync' },
      icon: 'mdi-sync',
      title: i18n.t('sync'),
    }, {
      showIf: extraModulesEnabled.value,
      icon: 'mdi-wifi',
      click () {
        console.log('TODO: ')
        showExtraModal.value = true
      },
      title: i18n.t('extra_modules'),
    }, {
      showIf: isCordovaBuild.value,
      to: { name: 'HistoryView' },
      icon: 'mdi-history',
      title: i18n.t('history'),
    }],
  }, {
    title: i18n.t('admin'),
    showIf: isWeb.value,
    items: [{
      to: { name: 'Home' },
      icon: 'mdi-chart-line',
      title: i18n.t('dashboard'),
    }, {
      to: { name: 'Users' },
      icon: 'mdi-account-box-multiple',
      title: i18n.t('users'),
      showIf: userHasPermission(TrellisPermission.VIEW_USERS),
    }, {
      to: { name: 'Forms' },
      icon: 'mdi-form-select',
      title: i18n.t('forms'),
    }, {
      to: { name: 'Reports' },
      icon: 'mdi-content-save',
      title: i18n.t('reports'),
      showIf: userHasPermission(TrellisPermission.VIEW_REPORTS),
    }, {
      to: { name: 'DataImport' },
      icon: 'mdi-upload',
      title: i18n.t('data_import'),
      showIf: userHasPermission(TrellisPermission.IMPORT_RESPONDENTS),
    }, {
      to: { name: 'Devices' },
      icon: 'mdi-cellphone-link',
      title: i18n.t('devices'),
      showIf: userHasPermission(TrellisPermission.VIEW_DEVICES),
    }, {
      to: { name: 'Studies' },
      icon: 'mdi-book-open-blank-variant',
      title: i18n.t('studies'),
      showIf: userHasPermission(TrellisPermission.VIEW_STUDIES),
    }, {
      to: { name: 'GeoTypes' },
      icon: 'mdi-map-plus',
      title: i18n.t('geo_types'),
    }],
  }, {
    title: 'settings',
    items: [{
      click: openStudySelector,
      icon: 'mdi-clipboard-text',
      title: i18n.t('change_study'),
    }, {
      click: openLocaleSelector,
      title: i18n.t('change_locale'),
      icon: 'mdi-web',
    }, {
      showIf: !!global.study,
      click: toggleTestMode,
      icon: isTestMode.value ? 'mdi-test-tube' : 'mdi-test-tube-empty',
      title: i18n.t('test_mode'),
      switchColor: 'warning',
      iconColor: null,
      switchValue: isTestMode.value,
    }, {
      click: toggleDarkTheme,
      icon: 'mdi-theme-light-dark',
      title: i18n.t('toggle_dark'),
      switchColor: 'success',
      iconColor: null,
      switchValue: global.darkTheme,
    }, {
      click: toggleBatterySaver,
      title: i18n.t('battery_saver'),
      icon: 'mdi-battery-alert',
      switchColor: 'green',
      switchValue: global.cpuOptimized,
      showIf: isCordovaBuild.value,
    }, {
      click: toggleGPSWatch,
      title: i18n.t('track_location'),
      iconColor: global.watchGPS ? (global.gpsFixed ? 'green' : 'yellow') : null,
      switchColor: global.watchGPS ? (global.gpsFixed ? 'green' : 'yellow') : null,
      icon: global.watchGPS
        ? (global.gpsFixed ? 'mdi-crosshairs-gps' : 'mdi-crosshairs')
        : 'mdi-crosshairs-question',
      switchValue: global.watchGPS,
      showIf: isCordovaBuild.value,
    }],
  }, {
    title: i18n.t('general'),
    items: [{
      to: { path: '/documentation/' },
      icon: 'mdi-help-circle',
      title: i18n.t('documentation'),
    }, {
      to: { name: 'Info' },
      icon: 'mdi-information',
      title: i18n.t('information'),
    }, {
      showIf: isInterview.value,
      click: () => emit('showConditionTags'),
      icon: 'mdi-tag',
      title: i18n.t('condition_tags'),
    }, {
      showIf: isLoggedIn.value,
      click: logout,
      icon: 'mdi-exit-to-app',
      title: i18n.t('logout'),
    }, {
      showIf: isLoggedIn.value,
      click: changePassword,
      icon: 'mdi-backup-restore',
      title: i18n.t('change_password'),
    }, {
      to: { name: 'ServerConfig' },
      icon: 'mdi-wrench',
      title: i18n.t('server_config'),
      showIf: isWeb.value && userHasPermission(TrellisPermission.VIEW_CONFIG),
    }, {
      click: logCheckpoint,
      icon: 'mdi-flag',
      title: 'Log Checkpoint',
    }, {
      to: { name: 'Permissions' },
      icon: 'mdi-lock',
      title: i18n.t('permissions'),
      showIf: isWeb.value && userHasPermission(TrellisPermission.VIEW_PERMISSIONS),
    }, {
      click: refresh,
      icon: 'mdi-refresh',
      title: i18n.t('refresh_app'),
    }, {
      showIf: isDebug.value,
      to: { name: 'ServiceTesting' },
      icon: 'mdi-check-all',
      title: 'Service Testing',
    }],
  }]
})

const visibleSections = computed(() => sections.value
  .filter(s => s.showIf !== false || !s.items.length)
  .map(s => {
    s.items = s.items.filter(i => i.showIf !== false)
    return s
  }))

</script>

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
      <template v-for="section in visibleSections">
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
    <TrellisModal
      v-model="showExtraModal"
      :title="$t('extra_modules')"
    >
      <v-list>
        <v-list-item
          v-for="item in enabledModules"
          :key="item.label"
          :to="item.to"
        >
          {{ item.label }}
        </v-list-item>
      </v-list>
    </TrellisModal>
  </v-flex>
</template>

<style scoped>
  .list__tile__title {
    line-height: 30px;
  }

</style>

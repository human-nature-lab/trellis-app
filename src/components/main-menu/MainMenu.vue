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
      <template v-for="section in sections">
        <v-divider></v-divider>
        <v-list dense subheader>
          <v-subheader v-if="section.title">
            {{ $t(section.title) }}
          </v-subheader>
          <v-divider v-if="section.title"></v-divider>
          <v-list-tile
            v-for="item in section.items"
            v-if="item.showIf !== false"
            @click="(e) => item.click && item.click(e)"
            v-bind="{to: item.to ? item.to : null}">
            <v-list-tile-action>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ $t(item.title) }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          </v-list>
      </template>
    </v-list>
    <v-dialog
      lazy
      v-model="showPasswordModal">
      <v-card>
        <v-container>
          <UserEditPassword :user="global.user"/>
        </v-container>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
  import config from '../../config'
  import menuBus from './MenuBus'
  import LoginService from '../../services/login'
  import router from '../../router'
  import SingletonService from '../../services/SingletonService'
  import storage from '../../services/StorageService'
  import global from '../../static/singleton'
  import {APP_ENV} from '../../static/constants'
  import UserEditPassword from '../../components/user/UserEditPassword'

  export default {
    components: { UserEditPassword },
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
      getItemProps (item) {
        const keys = ['icon', 'title', 'to']
        const props = {}
      },
      getItemOn (item) {
        const on = {}
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
      logout () {
        LoginService.logout().then(() => {
          router.push({name: 'Login', query: {to: router.currentRoute.fullPath}})
        })
      },
      toggleDarkTheme () {
        SingletonService.setDarkTheme(!SingletonService.get('darkTheme'))
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
      isLoggedIn () {
        return !!this.global && !!this.global.user
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
            showIf: this.isWeb,
            to: {name: 'Users'},
            icon: 'recent_actors',
            title: 'users'
          }, {
            showIf: this.global.offline,
            to: {name: 'Sync'},
            icon: 'sync',
            title: 'sync'
          }, {
            showIf: this.isDebug,
            to: {name: 'Documentation'},
            icon: 'help',
            title: 'documentation'
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
            title: 'toggle_dark'
          }]
        }, {
          title: 'general',
          items: [{
            to: {name: 'Info'},
            icon: 'info',
            title: 'information'
          }, {
            showIf: this.isInterview,
            click: () => this.emit('showConditionTags'),
            icon: 'local_offer',
            title: 'condition_tags'
          }, {
            click: this.logout,
            icon: 'exit_to_app',
            title: 'logout'
          }, {
            click: this.changePassword,
            icon: 'settings_backup_restore',
            title: 'change_password'
          }, {
            click: this.copyCurrentLocation,
            icon: 'location_searching',
            title: 'copy_url'
          }, {
            click: this.refresh,
            icon: 'refresh',
            title: 'refresh'
          }, {
            showIf: this.isDebug,
            to: { name: 'ServiceTesting' },
            icon: 'build',
            title: 'Service Testing'
          }]
        }]
      }
    }
  }
</script>

<style scoped>

</style>

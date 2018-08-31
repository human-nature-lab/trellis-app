<template>
  <v-flex>
    <v-list dense>
      <v-list-tile :dark="global.darkTheme">
        <v-list-tile-content>
        </v-list-tile-content>
        <v-list-tile-action @click="global.menuDrawer.open = false" class="text-right">
          <v-icon>arrow_back</v-icon>
        </v-list-tile-action>
      </v-list-tile>
      <v-divider></v-divider>
      <v-list-tile :to="{name: 'RespondentsSearch'}">
        <v-list-tile-action>
          <v-icon>group</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ $t('respondents') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile :to="{name: 'GeoSearch'}">
        <v-list-tile-action>
          <v-icon>place</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ $t('locations') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile v-if="global.offline" :to="{name: 'Sync'}">
        <v-list-tile-action>
          <v-icon>sync</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ $t('sync') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-divider></v-divider>
    <v-list dense subheader>
      <v-subheader>
        {{ $t('settings') }}
      </v-subheader>
      <v-list-tile :to="{name: 'Home', query: {to: $route.fullPath}}">
        <v-list-tile-action>
          <v-icon>assignment</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>
          {{ $t('change_study') }}
        </v-list-tile-title>
      </v-list-tile>
      <v-list-tile :to="{name: 'locale', query: {to: $route.fullPath}}">
        <v-list-tile-action>
          <v-icon>language</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>
          {{ $t('change_locale') }}
        </v-list-tile-title>
      </v-list-tile>
      <v-list-tile @click="toggleDarkTheme()">
        <v-list-tile-action>
          <v-icon>wb_sunny</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ $t('toggle_dark') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-divider></v-divider>
    <v-list dense subheader>
      <v-subheader>
        {{ $t('general') }}
      </v-subheader>
      <v-list-tile @click="copyCurrentLocation">
        <v-list-tile-action>
          <v-icon>location_searching</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          {{ $t('copy_url') }}
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile v-if="isInterview"
                   @click="emit('showConditionTags')">
        <v-list-tile-action>
          <v-icon>local_offer</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ $t('condition_tags') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile @click="refresh()">
        <v-list-tile-action>
          <v-icon>refresh</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ $t('refresh') }}
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile @click="logout">
        <v-list-tile-action>
          <v-icon>exit_to_app</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          {{ $t('logout') }}
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-snackbar
      absolute
      top
      vertical
      color="primary"
      :timeout="5000"
      v-model="showCopiedSnackbar">
      {{ $t('copied_url') }}
      <v-btn
        flat
        @click="showCopiedSnackbar = false">
        {{ $t('close') }}
      </v-btn>
    </v-snackbar>
  </v-flex>
</template>

<script>
  import menuBus from './MenuBus'
  import LoginService from '../../services/login'
  import router from '../../router'
  import SingletonService from '../../services/singleton/SingletonService'
  import global from '../../static/singleton'

  export default {
    name: 'dropdown-menu',
    data: () => ({
      showCopiedSnackbar: false,
      global
    }),
    methods: {
      refresh () {
        window.location.reload(true)
      },
      emit (eventName, ...args) {
        menuBus.$emit(eventName, ...args)
      },
      copyCurrentLocation () {
        navigator.clipboard.writeText(window.location.href).then(() => {
          this.showCopiedSnackbar = true
        })
      },
      logout () {
        LoginService.logout().then(() => {
          router.push({name: 'Login', query: {to: router.currentRoute.fullPath}})
        })
      },
      toggleDarkTheme () {
        SingletonService.setDarkTheme(!SingletonService.get('darkTheme'))
      }
    },
    computed: {
      isInterview () {
        return this.$route.name === 'Interview' || this.$route.name === 'InterviewPreview'
      }
    }
  }
</script>

<style scoped>

</style>

<template>
  <v-flex>
    <v-list dense>
      <v-list-tile class="grey lighten-4">
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
          <v-list-tile-title>Respondents</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile :to="{name: 'GeoSearch'}">
        <v-list-tile-action>
          <v-icon>place</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Locations</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-divider></v-divider>
    <v-list dense subheader>
      <v-subheader>Settings</v-subheader>
      <v-list-tile :to="{name: 'Home', query: {to: $route.fullPath}}">
        <v-list-tile-action>
          <v-icon>assignment</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>Change study</v-list-tile-title>
      </v-list-tile>
      <v-list-tile :to="{name: 'locale', query: {to: $route.fullPath}}">
        <v-list-tile-action>
          <v-icon>language</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>Change locale</v-list-tile-title>
      </v-list-tile>
      <v-list-tile @click="global.darkTheme=!global.darkTheme">
        <v-list-tile-action>
          <v-icon>wb_sunny</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            Toggle dark theme
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile @click="refresh()">
        <v-list-tile-action>
          <v-icon>refresh</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            Refresh app
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-divider></v-divider>
    <v-list dense subheader>
      <v-subheader>Context Options</v-subheader>
      <v-list-tile @click="copyCurrentLocation">
        <v-list-tile-action>
          <v-icon>location_searching</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          Copy location
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile v-if="isInterview"
                   @click="emit('showConditionTags')">
        <v-list-tile-action>
          <v-icon>local_offer</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>
            Condition tags
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-divider></v-divider>
    <v-list dense>
      <v-list-tile @click="logout">
        <v-list-tile-action>
          <v-icon>exit_to_app</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          Logout
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
      Current location copied to clipboard
      <v-btn
        flat
        @click="showCopiedSnackbar = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-flex>
</template>

<script>
  import menuBus from './MenuBus'
  import LoginService from '../../services/login/LoginService'
  import router from '../../router'

  export default {
    name: 'dropdown-menu',
    data: () => ({
      showCopiedSnackbar: false
    }),
    methods: {
      emit: function (eventName, ...args) {
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
      }
    },
    computed: {
      isInterview: function () {
        return this.$route.name === 'Interview' || this.$route.name === 'InterviewPreview'
      }
    }
  }
</script>

<style scoped>

</style>

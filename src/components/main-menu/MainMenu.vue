<template>
  <v-menu offset-y :nudge-top="-15" z-index="1000">
    <v-btn icon slot="activator">
      <v-icon>more_vert</v-icon>
    </v-btn>
    <v-list>
      <v-list-tile>
        <router-link :to="{name: 'RespondentsSearch'}">Respondents</router-link>
      </v-list-tile>
      <v-list-tile>
        <router-link :to="{name: 'GeoSearch'}">Locations</router-link>
      </v-list-tile>
      <v-list-tile>
        <router-link :to="{name: 'Home', query: {to: $route.fullPath}}">Change study</router-link>
      </v-list-tile>
      <v-list-tile>
        <router-link :to="{name: 'locale', query: {to: $route.fullPath}}">Change locale</router-link>
      </v-list-tile>
      <v-list-tile v-if="isInterview">
        <a @click="emit('showConditionTags')">Condition tags</a>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
  import menuBus from './MenuBus'

  export default {
    name: 'dropdown-menu',
    methods: {
      emit: function (eventName, ...args) {
        menuBus.$emit(eventName, ...args)
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

<template>
  <div>
    <v-autocomplete
      v-on="$listeners"
      :value="value"
      item-value="id"
      item-text="name"
      chips
      :label="$t('users')"
      @input="$emit('input', $event)"
      :search-input.sync="search"
      :items="users"
      :error="!!error"
      :hide-no-data="!hasLoaded"
      :loading="isLoading"
      v-bind="$attrs" />
    <v-alert :value="error" type="error" dismissable>
      {{error}}
    </v-alert>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import StudyService from '../../services/study'

  export default Vue.extend({
    name: 'UserAutocomplete',
    props: {
      value: [String, Array],
      study: String
    },
    data () {
      return {
        isLoading: false,
        hasLoaded: false,
        error: null,
        search: '',
        users: []
      }
    },
    watch: {
      async search () {
        if (this.hasLoaded || this.isLoading) return
        this.isLoading = true
        try {
          const users = await StudyService.getStudyUsers(this.study)
          users.sort((a, b) => a.name.localeCompare(b.name))
          this.users = users
          this.hasLoaded = true
          this.error = null
        } catch(err) {
          this.error = err
        } finally {
          this.isLoading = false
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>
<template>
  <v-autocomplete
    v-on="$listeners"
    :value="value"
    item-key="id"
    item-text="name"
    :label="$t('users')"
    @input="$emit('input', $event)"
    :search-input.sync="search"
    :items="users"
    :hide-no-data="!hasLoaded"
    :loading="isLoading"
    v-bind="$attrs" />
</template>

<script lang="ts">
  import Vue from 'vue'
  import StudyService from '../../services/study/StudyService'

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
          this.users = await StudyService.getStudyUsers(this.study)
          this.hasLoaded = true
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
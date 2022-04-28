<template>
  <v-chip v-bind="$attrs" :close="!loading && close" v-on="$listeners" >
    <v-icon small class="mr-2">mdi-account-group</v-icon>
    {{ loading || error ? $t('loading') : name }}
    <v-progress-circular v-if="loading" size="10" indeterminate class="ml-2" />
  </v-chip>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Respondent from '../../entities/trellis/Respondent'
  import RespondentService from '../../services/respondent'

  export default Vue.extend({
    name: 'RespondentChip',
    props: {
      value: String,
      close: Boolean
    },
    data () {
      return {
        loading: false,
        respondent: null as Respondent,
        error: null
      }
    },
    created () {
      this.load()
    },
    methods: {
      async load () {
        try {
          this.loading = true
          this.respondent = await RespondentService.getRespondentById(this.value)
        } catch (err) {
          this.error = err
        } finally {
          this.loading = false
        }
      }
    },
    computed: {
      name (): string | undefined {
        if (!this.respondent) return
        for (const name of this.respondent.names) {
          if (name.isDisplayName) {
            return name.name
          }
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>
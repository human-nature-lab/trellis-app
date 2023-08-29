<template>
  <v-flex v-intersect="onIntersect">
    <v-toolbar flat>
      <v-toolbar-title>
        {{ $t('edges') }}
      </v-toolbar-title>
    </v-toolbar>
    <v-data-table
      :items="visibleEdges"
      :loading="loading"
      :headers="headers"
      item-key="key"
    >
      <template #item.outgoing="{ item }">
        <v-icon class="mr-2">{{ item.outgoing ? 'mdi-arrow-right' : 'mdi-arrow-left' }}</v-icon>
        <span>{{ item.outgoing ? $t('outgoing') : $t('incoming') }}</span>
      </template>
      <template #item.respondentId="{ item }">
        <router-link :to="{ name: 'Respondent', params: { respondentId: item.respondentId, studyId: studyId } }">
          {{ item.respondentId }}
        </router-link>
      </template>
    </v-data-table>
  </v-flex>
</template>

<script lang="ts">
import RespondentService from '@/services/respondent/'
import { EdgeDatum } from '@/services/respondent/RespondentServiceInterface'
import Vue from 'vue'

export default Vue.extend({
  name: 'RespondentEdges',
  props: {
    respondentId: String,
    studyId: String,
  },
  data () {
    return {
      visible: false,
      needsReload: true,
      loading: false,
      edges: [] as EdgeDatum[],
      headers: [{
        text: this.$t('edge_type'),
        value: 'outgoing',
      }, {
        text: this.$t('respondent_id'),
        value: 'respondentId',
      }, {
        text: this.$t('var_name'),
        value: 'varName',
      }],
    }
  },
  watch: {
    respondentId: {
      handler () {
        if (this.respondentId) {
          this.needsReload = true
          this.load()
        }
      },
      immediate: true,
    },
  },
  computed: {
    visibleEdges () {
      return this.edges.map(e => ({
        id: e.id,
        key: e.id + e.var_name,
        outgoing: e.source_respondent_id === this.respondentId,
        respondentId: e.source_respondent_id === this.respondentId ? e.target_respondent_id : e.source_respondent_id,
        varName: e.var_name,
      }))
    },
  },
  methods: {
    onIntersect (entries, observer, isIntersecting) {
      this.visible = isIntersecting
      if (this.visible) {
        this.load()
      }
    },
    async load () {
      if (!this.needsReload || !this.visible) {
        return
      }
      try {
        this.loading = true
        this.edges = await RespondentService.listEdges(this.respondentId)
      } catch (err) {
        this.logError(err)
      } finally {
        this.loading = false
        this.needsReload = false
      }
    },
  },
})
</script>

<style lang="sass">

</style>

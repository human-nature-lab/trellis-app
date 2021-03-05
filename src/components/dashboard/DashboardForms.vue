<template>
  <v-col v-intersect="onIntersect">
    <v-card-title>
      Forms
    </v-card-title>
    <v-row v-if="isLoading">
      <v-col cols="12" md="6" v-for="i in 4" :key="i">
        <v-card>
          <v-skeleton-loader
            type="card-heading,image" />
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12" md="6" v-for="(form, id) in forms" :key="id">
        <SparkCard
          :title="form.form.name"
          :value="form.data.data"
          :min="min"
          :max="max"
          :labels="form.data.labels">
          <template #title>
            <TranslatedText
              :translation="form.form.nameTranslation"
              :locale="locale" />
          </template>
        </SparkCard>
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import Form from '../../entities/trellis/Form'
  import { adminInst } from '../../services/http/AxiosInstance'
  import SparkCard, { SparkData } from './SparkCard.vue'
  import TranslatedText from '../TranslatedText.vue'

  export default Vue.extend({
    name: 'DashboardForms',
    components: { SparkCard, TranslatedText },
    props: {
      study: String,
      locale: Object,
      min: String,
      max: String
    },
    data () {
      return {
        hasLoaded: false,
        isLoading: false,
        forms: {} as PropOptions<{[key: string]: { form: Form, data: SparkData }}>
      }
    },
    watch: {
      study () {
        this.load()
      },
      min () {
        this.load()
      },
      max () {
        this.load()
      }
    },
    methods: {
      onIntersect (entries: { isIntersecting: boolean }[]) {
        if (this.hasLoaded) return
        if (entries[0].isIntersecting) {
          this.load()
          this.hasLoaded = true
        }
      },
      async load () {
        this.isLoading = true
        try {
          const res = await adminInst.get(`study/${this.study}/dashboard/forms`, {
            params: {
              min: this.min,
              max: this.max
            }
          })
          const forms = res.data
          for (const id in forms) {
            forms[id].form = new Form().fromSnakeJSON(forms[id].form)
          }
          this.forms = forms
        } finally {
          this.isLoading = false
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>
<template>
  <v-form :disabled="isWorking" v-model="isValid">
    <v-row>
      <v-col>
        <v-subheader>
          Running reports
        </v-subheader>
        <v-row class="px-7 py-4">
          {{reports.map(r => r.name).join(', ')}}
        </v-row>
      </v-col>
    </v-row>
    <v-row
      class="px-7 py-2"
      v-for="field in fields" 
      :key="field.name">
      <v-text-field
        :label="field.name"
        v-model="config[field.name]"
        required />
    </v-row>
    <v-row class="ma-2">
      <v-spacer />
      <v-btn text @click="$emit('close')">
        Cancel
      </v-btn>
      <v-btn 
        color="success"
        :disabled="!isValid || isWorking"
        :loading="isWorking"
        @click="dispatch">
        Run
      </v-btn>
    </v-row>
  </v-form>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import { ReportType } from '../../entities/web/ReportType'
  import ReportService from '../../services/report/ReportService'
  import global from '../../static/singleton'

  export default Vue.extend({
    name: 'ReportDispatcher',
    props: {
      reports: {
        type: Array,
        required: true
      } as PropOptions<ReportType[]>
    },
    data () {
      return {
        global,
        isValid: false,
        isWorking: false,
        config: {
          studyId: global.study.id
        } as object
      }
    },
    computed: {
      fields (): { name: string, config: string }[] {
        const allFields = {} as any
        for (const report of this.reports) {
          for (const key in report.configSchema) {
            // TODO: Should we throw an error on duplicate configs if they don't
            //  match here?
            allFields[key] = report.configSchema[key]
          }
        }
        return Object.keys(allFields).map(name => ({
          name,
          config: allFields[name]
        }))
      }
    },
    methods: {
      async dispatch () {
        if (this.isWorking) return
        const config = JSON.parse(JSON.stringify(this.config))
        this.isWorking = true
        try {
          const reports = await ReportService.dispatchReports(this.global.study.id, this.reports.map(r => r.name), config)
          this.$emit('done', reports)
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>

<style lang="sass">
  
</style>
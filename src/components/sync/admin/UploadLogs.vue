<template>
  <td v-if="isOpen" colspan="8">
    <v-data-table
      :loading="isLoading"
      :headers="headers"
      :error="error"
      :options.sync="pagination"
      :items="meta">
      <template v-slot:item="{ item  }">
        <tr class="dense">
          <td>{{item.name}}</td>
          <td>{{item.inserted}}</td>
          <td>{{item.updated}}</td>
        </tr>
      </template>
    </v-data-table>
  </td>
</template>

<script lang="ts">
  import UploadLogService from '../../../services/upload/index'
  import Vue from 'vue'
  import UploadLog from '../../../entities/web/UploadLog'

  interface MetaBlock {
    name: string
    inserted: number
    updated: number
  }

  export default Vue.extend({
    name: 'UploadLogs',
    props: {
      upload: {
        type: Object,
        required: true
      },
      isOpen: {
        type: Boolean
      }
    },
    data () {
      return {
        pagination: {
          sortBy: ['name'],
          itemsPerPage: 25
        },
        error: null,
        showFull: false,
        isLoading: false,
        headers: [{
          text: 'Type',
          value: 'name'
        }, {
          text: 'Added',
          value: 'inserted'
        }, {
          text: 'Updated',
          value: 'updated'
        }],
        meta: [] as MetaBlock[],
        logs: [] as UploadLog[]
      }
    },
    watch: {
      isOpen (newVal) {
        if (newVal) {
          this.showLogs()
        }
      }
    },
    created () {
      if (this.isOpen) {
        this.showLogs()
      }
    },
    methods: {
      getMeta (logs: UploadLog[], name: string, key: string): MetaBlock {
        logs = logs.filter(u => u.tableName === key)
        return {
          name: name,
          inserted: logs.filter(l => l.operation === 'INSERT').length,
          updated: logs.filter(l => l.operation === 'UPDATE').length
        }
      },
      async showLogs () {
        if (this.logs && this.logs.length) return

        try {
          this.isLoading = true
          this.logs = await UploadLogService.getLogs(this.upload.id)
          const rows = [{
            key: 'survey',
            name: 'Surveys'
          }, {
            key: 'interview',
            name: 'Interviews'
          }, {
            key: 'respondent',
            name: 'Respondents'
          }, {
            key: 'geo',
            name: 'Geos'
          }, {
            key: 'photo',
            name: 'Photos'
          }, {
            key: 'action',
            name: 'Actions'
          }, {
            key: 'question_datum',
            name: 'Questions Answered'
          }, {
            key: 'datum',
            name: 'Data'
          }, {
            key: 'respondent_name',
            name: 'Respondent Names'
          }, {
            key: 'respondent_geo',
            name: 'Respondent Geos'
          }, {
            key: 'respondent_photo',
            name: 'Respondent Photos'
          }]
          for (let d of rows) {
            this.meta.push(this.getMeta(this.logs, d.name, d.key))
          }
        } catch (err) {
          this.error = err
        } finally {
          this.isLoading = false
        }
      }
    }
  })
</script>

<style lang="sass" scoped>
  .dense
    height: auto !important
    th, td
      padding: 2px !important
      height: auto !important
</style>

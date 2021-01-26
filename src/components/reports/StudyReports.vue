import { StudyReportType } from '../../services/report/ReportService'
<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>
        {{$t('study_reports')}}
      </v-toolbar-title>
    </v-toolbar>
    <v-data-table
      :value="value"
      :headers="headers"
      @input="$emit('input', $event)"
      :items="reportTypes"
      item-key="value"
      select-all
      hide-default-footer>
      <template v-slot:item="props">
        <td :active="props.selected">
          <v-checkbox
            @click="props.selected = !props.selected"
            :input-value="props.selected"
            primary
            hide-details />
        </td>
        <td>
          {{props.item.title}}
        </td>
        <td>
          <span v-if="reportIsLoading(props.item)">
            <TrellisLoadingCircle size="20px" />
          </span>
          <span v-else-if="props.item.report">
            {{props.item.report.createdAt}}
          </span>
          <span v-else>
            No reports
          </span>
        </td>
      </template>
    </v-data-table>
  </v-flex>
</template>

<script lang="ts">
  import Vue, {PropOptions} from 'vue'
  import Report from '../../entities/web/Report'
  import { StudyReportType } from '../../services/report/ReportService'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'

  interface StudyReportTypeObj {
    title: string
    value: string
    report?: Report
  }

  export default Vue.extend({
    name: 'StudyReports',
    components: { TrellisLoadingCircle },
    props: {
      value: <PropOptions<string[]>>{
        type: Array,
        required: true
      },
      reportsAreLoading: {
        type: Boolean,
        required: true
      },
      reports: <PropOptions<Report[]>> {
        type: Array,
        required: true
      }
    },
    data () {
      return {
        headers: [{
          text: 'Type',
          sortable: false
        }, {
          text: this.$t('latest_report'),
          sortable: false
        }],
        types: [{
          title: 'Respondents',
          value: StudyReportType.RESPONDENT
        }, {
          title: 'Locations',
          value: StudyReportType.LOCATIONS
        }, {
          title: 'Edges',
          value: StudyReportType.EDGES
        }, {
          title: 'Respondent locations',
          value: StudyReportType.RESPONDENT_LOCATIONS
        }, {
          title: 'Actions',
          value: StudyReportType.ACTIONS
        }, {
          title: 'Interviews',
          value: StudyReportType.INTERVIEWS
        }, {
          title: 'Timing',
          value: StudyReportType.TIMING
        }] as StudyReportTypeObj[]
      }
    },
    methods: {
      reportIsLoading (r: StudyReportTypeObj): boolean {
        return this.reportsAreLoading || (!!r.report && r.report.status === 'queued')
      }
    },
    computed: {
      reportTypes (): StudyReportTypeObj[] {
        return this.types.map(t => {
          t.report = this.reports.find(r => r.type === t.value)
          return t
        })
      }
    }
  })
</script>

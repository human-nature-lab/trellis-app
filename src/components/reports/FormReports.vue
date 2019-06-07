<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>
        {{$t('form_reports')}}
      </v-toolbar-title>
    </v-toolbar>
    <v-data-table
      :loading="formsAreLoading"
      :headers="headers"
      :items="formsWithReports"
      :value="value"
      @input="$emit('input', $event)"
      item-key="id"
      select-all
      hide-actions>
      <template
        slot="items"
        slot-scope="props">
        <td :active="props.selected">
          <v-checkbox
            @click="props.selected = !props.selected"
            :input-value="props.selected"
            primary
            hide-details />
        </td>
        <td>
          {{translate(props.item.nameTranslation, global.locale)}}
        </td>
        <td>
          <span v-if="reportIsLoading(props.item)">
            <TrellisLoadingCircle size="25px" />
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
  import FormService from '../../services/form/FormService'
  import Form from "../../entities/trellis/Form"
  import TranslateMixin from '../../mixins/TranslateMixin'
  import global from '../../static/singleton'
  import Report from "../../entities/web/Report"
  import Vue, {PropOptions} from 'vue'
  import TrellisLoadingCircle from '../TrellisLoadingCircle.vue'

  interface FormWithReport extends Form {
    report?: Report
  }

  export default Vue.extend({
    name: 'FormReports',
    components: { TrellisLoadingCircle },
    mixins: [ TranslateMixin ],
    props: {
      value: <PropOptions<string[]>>{
        type: Array,
        required: true
      },
      reportsAreLoading: {
        type: Boolean,
        required: true
      },
      studyId: {
        type: String,
        required: true
      },
      reports: <PropOptions<Report[]>>{
        type: Array,
        required: true
      }
    },
   data () {
      return {
        global,
        formsAreLoading: false,
        selected: [],
        forms: [] as Form[],
        headers: [{
          text: this.$t('name'),
          value: 'nameTranslation.translatedText',
          sortable: false
        }, {
          text: this.$t('latest_report'),
          sortable: false
        }],
        localReports: this.reports
      }
    },
    created () {
      this.loadForms()
    },
    computed: {
      hasSelected (): boolean {
        return this.selected.length > 0
      },
      formsWithReports (): FormWithReport[] {
        console.log('forms with reports')
        return this.forms.map(f => {
          f = f.copy()
          const report = this.localReports.find(r => r.formId === f.id)
          const n: FormWithReport = <FormWithReport>f
          // @ts-ignore
          n.report = report ? report : {}
          return f
        }) as FormWithReport[]
      }
    },
    methods: {
      async loadForms (): Promise<void> {
        this.formsAreLoading = true
        this.forms = (await FormService.getStudyForms(this.studyId)).map(sf => sf.form)
        this.forms.sort((a, b) => {
          // @ts-ignore
          return this.translate(a.nameTranslation, this.global.locale).localeCompare(this.translate(b.nameTranslation, this.global.locale))
        })
        this.formsAreLoading = false
      },
      reportIsLoading (form: FormWithReport): boolean {
        return this.reportsAreLoading || (!!form.report && form.report.status === 'queued')
      }
    },
    watch: {
      reports (newVal) {
        this.localReports = newVal
      }
    }
  })
</script>

<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>
        {{ $t('respondent_fill_tag') }}
      </v-toolbar-title>
    <v-spacer />
    </v-toolbar>
    <v-data-table
      v-if="respondentFills !== undefined"
      class="mb-4"
      :headers="fillHeaders"
      :items="respondentFills"
      :items-per-page="-1"
      hide-default-footer>
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.name }}</td> <!-- respondent Name -->
          <td class="text-xs-right">{{ item.val }}</td> <!-- respondent Value-->
        </tr>
      </template>
    </v-data-table>
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import Vue from 'vue'

  import RespondentFill from '../../entities/trellis/RespondentFill'
  import RespondentService from '../../services/respondent'

  export default Vue.extend({
    data () {
      return {
        respondentFills : undefined,
        fillHeaders: [{
          text: 'Name',
          value: 'name',
          width: '50%',
//        class: 'main-column'
        }, {
          text: 'Value',
          value: 'val',
          align: 'right',
          width: '45%'
        }, {
          text: '',
          value: '',
          width: '5%',
          sortable: false
        }],
      }
    },
    async created() {
      // TODO: Load respondent condition tags if they aren't passed inawait RespondentService.getRespondentFillsById(respond.id)
      try {
        let respondentFills = await RespondentService.getRespondentFillsById(this.respondent.id)
        this.respondentFills = respondentFills
      } catch (err) {
        if (this.isNotAuthError(err)) {
          this.logError(err)
        }
      }
    },
    props: {
      respondent: {
        type: Object,
        required: true
      }
    },
    components: {},
    name: 'RespondentFill',
    methods: {}
  })
</script>

<style lang="sass" scoped>
</style>

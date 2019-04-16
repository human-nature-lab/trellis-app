<template>
  <v-flex>
    <v-toolbar flat>
      <v-toolbar-title>
        {{ $t('respondent_fill_tag') }}
      </v-toolbar-title>
    <v-spacer />
    </v-toolbar>
    <v-data-table
      class="mb-3"
      :headers="fillHeaders"
      :items="respondentFills"
      hide-actions>
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td> <!-- respondent Name -->
        <td class="text-xs-right">{{ props.item.val }}</td> <!-- respondent Value-->
      </template>
    </v-data-table>
  </v-flex>
</template>

<script lang="ts">
  // @ts-ignore
  import Vue from 'vue'

  import RespondentFill from "../../entities/trellis/RespondentFill"
  import RespondentService from '../../services/respondent/RespondentService'

  export default Vue.extend({
    data () {
      return {
        respondentFills : [],
        fillHeaders: [{
          text: 'Name',
          value: 'name',
          width: '50%',
//          class: 'main-column'
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
        this.respondentFills = await RespondentService.getRespondentFillsById(this.respondent.id)
      } catch (err) {
        this.log(err)
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

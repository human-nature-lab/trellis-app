<template>
    <v-flex class="add-respondent">
      <v-layout>
        <v-flex>
          <v-text-field
            label="Respondent name"
            v-model="newRespondent.name"/>
        </v-flex>
      </v-layout>
    </v-flex>
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import actionBus from '../services/actions/ActionBus'
  export default {
    name: 'add-respondent-question',
    props: ['question'],
    data () {
      return {
        newRespondent: {
          name: ''
        },
        respondent:
      }
    },
    computed: {
      respondent () {
        if (this.question.datum.data.length) {
          return this.question.datum
        }
      }
    },
    mixins: [QuestionDisabledMixin]
  }
</script>

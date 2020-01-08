<template>
    <v-date-picker
      v-model="date"
      reactive
      :min="min"
      :max="max"
      :landscape="$vuetify.breakpoint.smAndUp"
      :locale="locale"
      :disabled="isQuestionDisabled">
    </v-date-picker>
</template>

<script>
  import QuestionDisabledMixin from '../mixins/QuestionDisabledMixin'
  import ActionMixin from '../mixins/ActionMixin'
  import AT from '../../../static/action.types'
  import PT from '../../../static/parameter.types'
  import global from '../../../static/singleton'
  import * as moment from 'moment'

  export default {
    name: 'date-question',
    created () {
      this.locale = global.locale.languageTag
    },
    data () {
      return {
        locale: 'en-us'
      }
    },
    mixins: [QuestionDisabledMixin, ActionMixin],
    props: {
      question: {
        type: Object,
        required: true
      }
    },
    methods: {
      dateVal (val) {
        const TODAY = 'TODAY'
        if (val.substr(0, 5) === TODAY) {
          const n = moment()
          if (val.includes('+')) {
            const exp = val.split('+')[1]
            n.add(JSON.parse(exp))
          } else if (val.includes('-')) {
            const exp = val.split('-')[1]
            n.subtract(JSON.parse(exp))
          }
          return n.format('YYYY-MM-DD')
        } else {
          return moment(val, ['YYYY-MM-DD', 'YYYY-M-D']).format('YYYY-MM-DD')
        }
        return null
      }
    },
    computed: {
      date: {
        get: function () {
          return this.question.datum.data.length ? this.question.datum.data[0].val : null
        },
        set: function (val) {
          this.action(AT.set_date, {
            val: val
          })
        }
      },
      min () {
        const v = this.question.questionParameters.find(qp => {
          return qp.parameterId == PT.min_date && qp.val
        })
        return v ? this.dateVal(v.val) : null
      },
      max () {
        const v = this.question.questionParameters.find(qp => {
          return qp.parameterId == PT.max_date && qp.val
        })
        return v ? this.dateVal(v.val) : null
      }
    }
  }
</script>

<style scoped>

</style>

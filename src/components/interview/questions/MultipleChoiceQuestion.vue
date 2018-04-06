<template>
  <div class="multiple-choice">
    <v-checkbox
      v-for="choice in question.choices"
      :label="choice.text"
      :key="choice.val"
      v-model="selected[choice.id]"
      @change="onChange(choice.id, selected[choice.id])"/>
  </div>
</template>

<script>
  import actionBus from '../services/ActionBus'
  export default {
    props: ['question'],
    name: 'multiple-choice-question',
    data: function () {
      return {
        _selected: {}
      }
    },
    computed: {
      selected: function () {
        let selected = this.question.choices.reduce((agg, choice) => {
          agg[choice.id] = this.question.datum.data.findIndex(datum => datum.val === choice.id) > -1
          return agg
        }, {})
        console.log('selected multiple choice', selected)
        return selected
      }
    },
    methods: {
      onChange: function (choiceId, val) {
        if (val) {
          actionBus.action({
            action_type: 'select-choice',
            question_datum_id: this.question.datum.id,
            payload: {
              choice_id: choiceId
            }
          })
        } else {
          actionBus.action({
            action_type: 'deselect-choice',
            question_datum_id: this.question.datum.id,
            payload: {
              choice_id: choiceId
            }
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>

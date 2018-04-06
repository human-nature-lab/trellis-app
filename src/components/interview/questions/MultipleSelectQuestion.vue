<template>
  <div class="multiple-select">
    <v-checkbox
      v-for="choice in question.choices"
      :value="choice.val"
      :label="choice.text"
      :key="choice.val"
      @change="onChange(choice)"/>
  </div>
</template>

<script>
  import actionBus from '../services/ActionBus'
  export default {
    props: ['question'],
    name: 'multiple-select-question',
    computed: {
      selected: function () {
        return this.question.data || []
      }
    },
    methods: {
      onChange: function (choice) {
        console.log('change', choice)
      },
      onSelected: function (choice) {
        actionBus.action({
          action_type: 'select_choice',
          question_datum_id: this.question.datum.id,
          payload: {
            choice_id: choice.id
          }
        })
      },
      onDeselected: function (choice) {
        actionBus.action({
          action_type: 'deselect-choice',
          question_datum_id: this.question.datum.id,
          payload: {
            choice_id: choice.id
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>

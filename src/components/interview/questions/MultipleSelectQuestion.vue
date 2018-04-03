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
  import { sharedActionManager } from '../services/ActionManager'
  export default {
    props: ['question'],
    name: 'multiple-select-question',
    mounted: function () {
      this.actions = sharedActionManager() // This could be a race condition if the interviewId isn't passed in first from the first caller of this function
    },
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
        this.actions.pushUserAction(this.question.id, 'select-choice', {
          choiceId: choice.id
        })
      },
      onDeselected: function (choice) {
        this.actions.pushUserAction(this.question.id, 'deselect-choice', {
          choiceId: choice.id
        })
      }
    }
  }
</script>

<style scoped>

</style>

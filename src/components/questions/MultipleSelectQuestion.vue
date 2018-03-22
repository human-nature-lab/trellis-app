<template>
  <div class="multiple-choice">
    <trellis-multi-select
      :selected="selected"
      :choices="question.choices"
      @selected="onSelected"
      @deselected="onDeselected"
    ></trellis-multi-select>
  </div>
</template>

<script>
  import TrellisMultiSelect from '../TrellisMultiSelect'
  import {sharedActionManager} from '../../ActionManager'
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
    },
    components: {
      TrellisMultiSelect
    }
  }
</script>

<style scoped>

</style>

<template>
  <div class="multiple-choice">
    <v-checkbox
      v-for="choice in question.choices"
      :value="choice.val"
      :label="choice.text"
      :key="choice.val"
      v-model="selected"
      @change="onChange(choice, selected)"/>
  </div>
</template>

<script>
  import {sharedActionManager} from '../services/ActionManager'
  export default {
    props: ['question'],
    name: 'multiple-choice-question',
    data: function () {
      return {
        actions: sharedActionManager(),
        _selected: []
      }
    },
    computed: {
      selected: {
        get: function () {
          this._selected = this.question.choices.filter(choice => {
            return this.question.data.find(datum => datum.val === choice.val)
          }).map(choice => choice.val)
          return this._selected
        },
        set: function (newValue) { /* Empty setter. Setting happens in the onChange method */ }
      }
    },
    methods: {
      onChange: function (choice, selected) {
        console.log('change', choice, selected)
        if (selected.indexOf(choice.val) > -1) {
          this.actions.pushUserAction(this.question.id, 'deselect-choice', {
            choiceId: choice.id
          })
        } else {
          this.actions.pushUserAction(this.question.id, 'select-choice', {
            choiceId: choice.id
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>

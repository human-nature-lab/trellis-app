<template>
  <div class="multiple-choice">
    <trellis-multi-select
      :selected="selected"
      :choices="question.choices"
      @selected="onSelected"
      @deselected="onDeselected"
    />
  </div>
</template>

<script>
  import TrellisMultiSelect from '../TrellisMultiSelect'
  export default {
    props: ['question'],
    name: 'multiple-choice-question',
    computed: {
      selected: function () {
        return []
      }
    },
    methods: {
      onSelected: function () {},
      onDeselected: function () {}
    },
    components: {
      TrellisMultiSelect
    }
  }
</script>

<style scoped>

</style>

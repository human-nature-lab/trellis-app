<template>
  <div class="trellis-multi-select">
    <div class="form-group" v-for="choice in choices">
      <div class="trellis-checkbox-container">
        <input type="checkbox"
               :value="choice.val"
               :checked="isChecked(choice)"
               @change="onChange"
               :id="choice.val" />
        <div class="trellis-checkbox"></div>
        <label :for="choice.val">{{choice.text}}</label>
      </div>
    </div>
  </div>
</template>

<script>
    // TODO: Handle choice parameters
    export default {
      name: 'trellis-multi-select',
      mounted: function () {
        this._selected = []
      },
      props: {
        choices: {
          validator: function (choices) {
            for (let choice of choices) {
              if (!(choice.value || choice.val) || !(choice.label || choice.text)) {
                return false
              }
            }
            return true
          }
        },
        selected: {
          type: Array,
          default: function () { return [] }
        }
      },
      methods: {
        isChecked: function (choice) {
          return this._selected.find(s => s === choice.val)
        },
        onChange: function (event) {
          this.$emit('change', {
            selected: this.selected,
            added: event.target.checked ? [event.target.value] : [],
            removed: event.target.checked ? [] : [event.target.value]
          })
          if (event.target.checked) {
            this.$emit('selected', this.choices.find(c => c.val === event.target.value || c.value === event.target.value))
          } else {
            this.$emit('deselected', this.choices.find(c => c.val === event.target.value || c.value === event.target.value))
          }
          this.log('trellis-multi-select changed', this.selected, event.target.value, event.target.checked)
        }
      }
    }
</script>

<style  lang="sass">
  .trellis-checkbox-container
    position: relative
    padding: 5px
    input[type=checkbox]
      opacity: 0
      position: absolute
      left: 0
      height: 100%
      width: 100%
      &:checked
        ~.trellis-checkbox:after
          content: '\2714'
          width: 20px
          height: 20px
          font-size: 16px
          color: green
          text-align: center
          float: left
    .trellis-checkbox
      height: 20px
      width: 20px
      border: 1px solid grey
      border-radius: 2px
      float: left
    label
      margin-left: 25px
</style>

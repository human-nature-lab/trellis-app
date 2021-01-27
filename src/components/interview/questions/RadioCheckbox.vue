<template>
  <div
    tabindex="0"
    role="radio"
    :aria-checked="value.toString()"
    class="input-group checkbox input-group--selection-controls"
    :class="classes"
    @click="onClick">
    <div class="v-input__slot">
      <div class="v-input--selection-controls__input" :class="{'input-group--disabled': disabled}">
        <v-icon class="icon--selection-control icon--checkbox" v-if="value">radio_button_checked</v-icon>
        <v-icon class="icon--selection-control icon--checkbox" v-else>radio_button_unchecked</v-icon>
        <div class="input-group--selection-controls__ripple" />
      </div>
      <label class="v-label">
        <slot name="label"></slot>
      </label>
      <v-spacer />
    </div>
    <div class="input-group__details">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'radio-checkbox',
    props: {
      value: {},
      disabled: {
        type: Boolean,
        default: false
      },
      color: {
        type: String,
        default: 'accent'
      }
    },
    computed: {
      classes: function () {
        return [{'input-group--disabled': this.disabled, 'input-group--active': !this.disabled}, `${this.color}--text`]
      }
    },
    methods: {
      onClick: function () {
        this.$emit('input', !this.value)
        this.$emit('change')
      }
    }
  }
</script>

<style>

</style>

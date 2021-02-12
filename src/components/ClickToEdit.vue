<template>
  <v-text-field
    autofocus
    :full-width="true"
    ref="textField"
    :disabled="disabled"
    :readonly="!internal.editing"
    :dense="dense"
    :solo="solo"
    :label="label"
    :loading="loading"
    hide-details
    :flat="true"
    :append-icon="appendIcon"
    :prepend-inner-icon="internal.editing ? 'mdi-close' : ''"
    @click:prepend-inner="resetEditorState"
    @click:append="onClickAppend"
    v-model="memText"
    @keyup.enter="save"
    class="min-text-field" />
</template>

<script lang="ts">
  import Vue from "vue";
  export default Vue.extend({
    name: "ClickToEdit",
    props: {
      value: {
        type: String,
        default: "Empty",
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      loading: Boolean,
      autofocus: {
        type: Boolean,
        default: true,
      },
      editable: {
        type: Boolean,
        default: true,
      },
      editing: {
        type: Boolean,
        default: false,
      },
      label: {
        type: String,
        default: "",
      },
      dense: {
        type: Boolean,
        default: true,
      },
      solo: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        memText: this.value,
        internal: {
          editing: this.editing,
        },
      };
    },
    watch: {
      value(newVal) {
        if (this.memText === newVal) return;
        this.resetEditorState();
      },
      editing(val) {
        this.internal.editing = val;
      },
    },
    computed: {
      hasEdits(): boolean {
        return this.memText !== this.value;
      },
      appendIcon(): string {
        if (!this.editable) {
          return null;
        } else if (this.internal.editing) {
          return "mdi-content-save";
        } else {
          return "mdi-pencil";
        }
      },
    },
    methods: {
      onClickAppend() {
        if (this.internal.editing) {
          this.save();
        } else {
          this.startEditing();
        }
      },
      resetEditorState() {
        this.memText = this.value;
        this.internal.editing = false;
        this.$emit("update:editing", this.internal.editing);
      },
      save() {
        if (this.hasEdits) {
          this.$emit("save", this.memText);
        } else {
          this.resetEditorState();
        }
        this.internal.editing = false;
      },
      startEditing() {
        this.internal.editing = true;
        this.$emit("update:editing", this.internal.editing);
        // Focus on the input box, we have to wait for the next tick so
        // the text field can be no longer readonly in order to focus it.
        this.$nextTick(() => {
          this.$refs["textField"].$refs.input.focus();
        })
      },
    },
  });
</script>

<style lang="sass">
.min-text-field
  padding-top: 0
  .input-group__details
    display: none
</style>

<template>
  <div
    ref="container"
    @click="$emit('click')"
  />
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import { basicSetup, EditorView } from '@codemirror/basic-setup'
import { EditorState, Compartment } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { ViewUpdate } from '@codemirror/view'

type Compartments = {
  readonly: Compartment
}

export default Vue.extend({
  props: {
    value: String,
    readonly: Boolean,
    language: {
      type: String,
      default: 'javascript',
    } as PropOptions<'javascript' | 'html'>,
  },
  mounted () {
    const compartments = {
      readonly: new Compartment(),
    }
    const view = new EditorView({
      state: EditorState.create({
        doc: this.value,
        extensions: [
          basicSetup,
          this.language === 'javascript' ? javascript() : html(),
          EditorView.updateListener.of(this.update),
          compartments.readonly.of(EditorState.readOnly.of(this.readonly)),
          EditorView.domEventHandlers({
            blur: e => { this.$emit('blur', e) },
            click: e => { this.$emit('click', e) },
          }),
        ],
      }),
      parent: this.$refs.container as Element,
    })
    this.view = view
    this.compartments = compartments
  },
  beforeDestroy () {
    const view = this.view as EditorView
    view.destroy()
  },
  watch: {
    readonly (newVal: boolean) {
      const c = this.compartments as Compartments
      const v = this.view as EditorView
      v.dispatch({
        effects: c.readonly.reconfigure(EditorState.readOnly.of(newVal)),
      })
    },
  },
  methods: {
    update (update: ViewUpdate) {
      if (update.docChanged) {
        const val = update.state.doc.sliceString(0)
        this.$emit('input', val)
        this.$emit('change', val)
      }
    },
  },
})

</script>

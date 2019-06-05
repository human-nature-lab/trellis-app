<template>
  <tr>
    <td>{{entry.key}}</td>
    <td>
      <ClickToEdit
        v-model="entry.value"
        :editing="isEditing"
        @save="updateEntry" />
    </td>
    <td>
      <v-btn
        color="error"
        @click="reset">
        {{$t('reset')}}
      </v-btn>
    </td>
  </tr>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Config from '../../entities/trellis/Config'
  import ConfigService from '../../services/config'
  import ClickToEdit from '../ClickToEdit.vue'

  export default Vue.extend({
    name: 'ConfigRow',
    components: { ClickToEdit },
    props: {
      entry: {
        type: Object as () => Config,
        required: true
      }
    },
    data () {
      return {
        isEditing: false
      }
    },
    methods: {
      async updateEntry (newValue: string) {
        try {
          this.entry.value = newValue
          await ConfigService.set(this.entry.key, this.entry.value)
          this.$emit('update', this.entry)
          this.isEditing = false
          this.alert('success', `Successfully updated ${this.entry.key}`)
        } catch (err) {
          this.log(err)
          this.alert('error', err.message, {timeout: 0})
        }
      },
      async reset () {
        if (!confirm(`Really reset ${this.entry.key}? This action cannot be undone.`)) return
        try {
          const entry = await ConfigService.reset(this.entry.key)
          this.$emit('update', entry)
          this.isEditing = false
          this.alert('success', `Successfully reset ${entry.key}`)
        } catch (err) {
          this.log(err)
          this.alert('error', err.message, {timeout: 0})
        }
      }
    }
  })
</script>

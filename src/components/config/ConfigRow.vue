<template>
  <tr>
    <td>{{entry.key}}</td>
    <td>
      <ClickToEdit
        v-model="entry.value"
        :editing="isEditing"
        :loading="isWorking"
        :disabled="isWorking"
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
        isWorking: false,
        isEditing: false
      }
    },
    methods: {
      async updateEntry (newValue: string) {
        try {
          this.isWorking = true
          this.entry.value = newValue
          await ConfigService.set(this.entry.key, this.entry.value)
          this.$emit('update', this.entry)
          this.isEditing = false
          this.alert('success', `Successfully updated ${this.entry.key}`)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        } finally {
          this.isWorking = false
        }
      },
      async reset () {
        if (!confirm(`Really reset ${this.entry.key}? This action cannot be undone.`)) return
        try {
          this.isWorking = true
          const entry = await ConfigService.reset(this.entry.key)
          this.$emit('update', entry)
          this.isEditing = false
          this.alert('success', `Successfully reset ${entry.key}`)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>

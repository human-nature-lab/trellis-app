<template>
  <v-col class="my-0 pa-0">
    <v-row no-gutters class="align-center justify-center">
      <v-col cols="1">{{ $t('assigns') }}</v-col>
      <v-col cols="2">
        <v-combobox
          class="mx-1"
          :value="value.conditionTag"
          :readonly="disabled"
          :items="conditionTags"
          item-text="name"
          @change="updateConditionTag"
        />
      </v-col>
      <v-col cols="1" class="text-center">{{ $t('to_the') }}</v-col>
      <v-col cols="2">
        <MenuSelect
          v-model="value.scope"
          :items="scopes"
          @change="update({ ...value })"
          :disabled="disabled"
        />
      </v-col>
      <v-col cols="1" class="text-center">{{ $t('if') }}</v-col>
      <v-col cols="4" class="text-left">
        <EditText
          outlined
          class="mx-1"
          editable
          :locked="disabled"
          code
          auto-grow
          textarea
          v-model="value.logic"
          @save="updateLogic"
        />
      </v-col>
      <v-col cols="1" class="px-0 text-right">
        <DotsMenu removable @remove="$emit('remove')" :loading="loading" />
      </v-col>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import type AssignConditionTag from '../../entities/trellis/AssignConditionTag'
import type ConditionTag from '../../entities/trellis/ConditionTag'
import Vue, { PropType } from 'vue'
import EditText from './EditText.vue'
import MenuSelect from './MenuSelect.vue'
import builder from '../../services/builder'
import DotsMenu from './DotsMenu.vue'

export default Vue.extend({
  name: "ConditionRow",
  props: {
    value: Object as PropType<AssignConditionTag>,
    conditionTags: Array as PropType<ConditionTag[]>,
    disabled: Boolean,
    loading: Boolean,
  },
  data() {
    return {
      working: false,
      scopes: ['respondent', 'form', 'section'],
    }
  },
  components: { EditText, MenuSelect, DotsMenu },
  methods: {
    async updateConditionTag(newVal: string | ConditionTag) {
      console.log('updateConditionTag', newVal)
      if (this.working) return
      if (typeof newVal === 'string') {
        try {
          this.working = true
          const val = this.value.copy()
          val.conditionTag = await builder.createConditionTag(newVal)
          val.conditionTagId = val.conditionTag.id
          this.update(val)
        } catch (err) {
          this.logError(err)
        } finally {
          this.working = false
        }
      } else {
        const v = this.value.copy()
        v.conditionTag = newVal
        v.conditionTagId = newVal.id
        this.update(v)
      }
    },
    async update(val: AssignConditionTag) {
      this.$emit('input', val)
    },
    updateLogic(logic: string) {
      this.update({ ...this.value, logic })
    }
  }
})
</script>

<style lang="sass">

</style>
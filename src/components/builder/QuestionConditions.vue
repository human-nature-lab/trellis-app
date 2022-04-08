<template>
  <v-col>
    <v-row no-gutters class="align-center">
      <h4>{{ $t('assigns_conditions') }}</h4>
      <v-spacer />
      <v-tooltip v-if="!disabled" left>
        <template #activator="{ on, attrs }">
          <v-btn @click="add" text icon v-bind="attrs" v-on="on">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        {{ $t('add_condition_tag') }}
      </v-tooltip>
    </v-row>
    <v-list>
      <v-list-item v-for="(act, index) in value" :key="act.id">
        <ConditionRow
          :value="value[index]"
          :disabled="disabled"
          :loading="workingIndex === index"
          :conditionTags="conditionTags"
          @input="update"
          @delete="remove(act)"
        />
      </v-list-item>
      <v-list-item v-if="placeholder">
        <ConditionRow
          :value="placeholder"
          :disabled="disabled"
          :conditionTags="conditionTags"
          :loading="placeholderWorking"
          @input="create"
          @delete="placeholder = null"
        />
      </v-list-item>
    </v-list>
  </v-col>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import AssignConditionTag from '../../entities/trellis/AssignConditionTag'
import type ConditionTag from '../../entities/trellis/ConditionTag'
import ConditionRow from './ConditionRow.vue'
import builderService from '../../services/builder'

const defaultLogic = 'function (vars, api) {\n  return true;\n}'
export default Vue.extend({
  props: {
    value: Array as PropType<AssignConditionTag[]>,
    conditionTags: Array as PropType<ConditionTag[]>,
    questionId: String,
    disabled: Boolean,
  },
  data() {
    return {
      placeholder: null as AssignConditionTag,
      workingIndex: -1,
      placeholderWorking: false,
    }
  },
  methods: {
    add() {
      this.placeholder = new AssignConditionTag()
      this.placeholder.logic = defaultLogic
      this.placeholder.scope = 'form'
    },
    async create(act: AssignConditionTag) {
      if (this.placeholderWorking || !act) return
      try {
        this.placeholderWorking = true
        const res = await builderService.createAssignConditionTag(this.questionId, {
          logic: act.logic,
          scope: act.scope,
          condition: act.conditionTag,
        })
        const v = this.value.slice()
        v.push(res)
        this.$emit('input', v)
        this.placeholder = null
      } catch (err) {

      } finally {
        this.placeholderWorking = false
      }
    },
    async update(act: AssignConditionTag) {
      if (this.workingIndex >= 0) return
      try {
        this.workingIndex = this.value.findIndex(a => a.id === act.id)
        const res = await builderService.updateAssignConditionTag(this.questionId, {
          id: act.id,
          logic: act.logic,
          scope: act.scope,
          condition: act.conditionTag,
        })
        const v = this.value.slice()
        v.splice(this.workingIndex, 1, res)
        this.$emit('input', v)
      } catch (err) {
        this.logError(err)
      } finally {
        this.workingIndex = -1
      }
    },
    async remove(act: AssignConditionTag) {
      if (this.workingIndex >= 0) return
      try {
        this.workingIndex = this.value.indexOf(act)
        await builderService.deleteAssignConditionTag(act)
        const v = this.value.slice()
        v.splice(this.workingIndex, 1)
        this.$emit('input', v)
      } catch (err) {
        this.logError(err)
      } finally {
        this.workingIndex = -1
      }
    },
  },
  components: { ConditionRow }
})

</script>
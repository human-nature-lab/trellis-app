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
      <v-list-item v-for="(act, index) in value" :ke="act.id">
        <ConditionRow v-model="value[index]" :disabled="disabled" :conditionTags="conditionTags" />
      </v-list-item>
      <v-list-item v-if="placeholder">
        <ConditionRow v-model="placeholder" :disabled="disabled" :conditionTags="conditionTags" />
      </v-list-item>
    </v-list>
  </v-col>
</template>

<script lang="ts">
import AssignConditionTag from '../../entities/trellis/AssignConditionTag'
import type ConditionTag from '../../entities/trellis/ConditionTag'
import Vue, { PropType } from 'vue'
import ConditionRow from './ConditionRow.vue'

const defaultLogic = `
function (vars, api) {
  return true;
}`
export default Vue.extend({
  props: {
    value: Array as PropType<AssignConditionTag[]>,
    conditionTags: Array as PropType<ConditionTag[]>,
    questionId: String,
    disabled: Boolean,
  },
  data () {
    return {
      placeholder: null as AssignConditionTag,
    }
  },
  methods: {
    add() {
      this.placeholder = new AssignConditionTag()
      this.placeholder.logic = defaultLogic
      this.placeholder.scope = 'form'
    },
    async create () {

    },
  },
  components: { ConditionRow }
})

</script>
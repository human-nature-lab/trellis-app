<template>
  <v-col>
    <v-row no-gutters class="align-center">
      <h4>{{ $t('assign_conditions') }}</h4>
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
      <v-list-item v-for="act in value">
        <v-col cols="3">
          <v-autocomplete v-model="act.conditionTagId" :readonly="disabled" :items="conditionTags" />
        </v-col>
        <v-col cols="9">
          <EditText editable :locked="disabled" code v-model="act.logic" />
        </v-col>
      </v-list-item>
    </v-list>
  </v-col>
</template>

<script lang="ts">
import AssignConditionTag from '../../entities/trellis/AssignConditionTag'
import ConditionTag from '../../entities/trellis/ConditionTag'
import Vue, { PropType } from 'vue'
import EditText from './EditText.vue'

export default Vue.extend({
  props: {
    value: Array as PropType<AssignConditionTag[]>,
    conditionTags: Array as PropType<ConditionTag[]>,
    questionId: String,
    disabled: Boolean,
  },
  methods: {
    async add() {
    },
  },
  components: { EditText }
})

</script>
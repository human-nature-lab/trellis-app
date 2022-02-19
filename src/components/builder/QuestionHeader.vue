<template>
  <v-row no-gutters class="blue-grey lighten-1 pa-4 white--text question-drag-handle align-center">
    <v-menu>
      <template #activator="{ attrs, on }">
        <v-chip v-bind="attrs" v-on="on" color="white">{{ value.questionType.name }}</v-chip>
      </template>
      <v-list>
        <v-list-item
          v-for="t in builder.questionTypes"
          :key="t.id"
          @click="updateQuestionType(t.id)"
        >{{ t.name }}</v-list-item>
      </v-list>
    </v-menu>
    <EditText
      class="ml-2"
      v-model="value.varName"
      @save="$emit('change', value)"
      editable
      :locked="builder.locked"
      :disabled="loading"
    />
    <v-spacer />
    <v-chip
      v-if="value.assignConditionTags && value.assignConditionTags.length"
      color="white"
      class="black--text"
      label
    >{{ $t('assigns_condition_tags', ['"' + value.assignConditionTags.map(act => act.conditionTag.name).join('","') + '"']) }}</v-chip>
    <!-- <v-autocomplete
      v-model="value.questionTypeId"
      single-line
      dense
      :disabled="builder.locked || loading"
      @change="$emit('change', value)"
      item-value="id"
      item-text="name"
      :items="builder.questionTypes"
    />-->
    <!-- <span class="pa-1 lowercase">{{ $t('type') }}:</span> -->
  </v-row>
</template>

<script lang="ts">
import Question from '../../entities/trellis/Question'
import Vue, { PropType } from 'vue'
import EditText from './EditText.vue'
import { builder } from '../../symbols/builder'

export default Vue.extend({
  name: 'QuestionHeader',
  inject: { builder },
  components: { EditText },
  props: {
    value: Object as PropType<Question>
  },
  methods: {
    updateQuestionType(typeId: string) {
      this.value.questionTypeId = typeId
      this.$emit('change', this.value)
    }
  }
})
</script>

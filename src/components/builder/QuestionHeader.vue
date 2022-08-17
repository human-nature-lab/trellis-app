<template>
  <v-col class="ma-0 pa-0 relative">
    <v-row
      no-gutters
      class="blue-grey lighten-1 pa-4 white--text question-drag-handle align-center"
    >
      <MenuSelect
        :disabled="builder.locked || loading"
        v-model="value.questionTypeId"
        :items="builder.questionTypes"
        item-text="name"
        item-value="id"
        @change="updateQuestionType"
      />
      <EditText
        class="ml-2"
        v-model="value.varName"
        @save="updateVarName"
        editable
        :locked="builder.locked"
        :disabled="loading"
      />
      <v-spacer />
      <BuilderChip
        :visible="!showChoices && value.choices && !!value.choices.length"
        @click="$emit('update:showChoices', true)"
      >
        {{ $tc('question_choices_n', value.choices.length) }}
      </BuilderChip>
      <BuilderChip
        :visible="!showConditions && value.assignConditionTags && !!value.assignConditionTags.length"
        @click="$emit('update:showConditions', true)"
      >
        {{ $t('assigns_condition_tags', [`"${conditionTagNames}"`]) }}
      </BuilderChip>
      <BuilderChip
        :visible="!showParameters && value.questionParameters && !!value.questionParameters.length"
        @click="$emit('update:showParameters', !showParameters)"
      >
        {{ $tc('question_parameters_n', value.questionParameters.length) }}
      </BuilderChip>
      <DotsMenu
        :disabled="builder.locked"
        dark
        removable
        class-name="question-handle"
        @remove="$emit('remove')"
      >
        <ToggleItem
          :value="showParameters"
          @input="$emit('update:showParameters', $event)"
          :on-title="$t('hide_parameters')"
          :off-title="$t('show_parameters')"
        />
        <ToggleItem
          :value="showConditions"
          @input="$emit('update:showConditions', $event)"
          :on-title="$t('hide_conditions')"
          :off-title="$t('show_conditions')"
        />
        <ToggleItem
          v-if="allowChoices"
          :value="showChoices"
          @input="$emit('update:showChoices', $event)"
          :on-title="$t('hide_choices')"
          :off-title="$t('show_choices')"
        />
        <v-list-item
          :disabled="builder.locked"
          @click="$emit('duplicate')"
        >
          <v-list-item-icon>
            <v-icon>mdi-content-duplicate</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            {{ $t('duplicate') }}
          </v-list-item-content>
        </v-list-item>
      </DotsMenu>
    </v-row>
    <v-progress-linear
      :active="loading"
      indeterminate
      absolute
      bottom
    />
  </v-col>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Question from '@/entities/trellis/Question'
import EditText from '@/components/util/EditText.vue'
import MenuSelect from '@/components/util/MenuSelect.vue'
import { builder } from '@/symbols/builder'
import DotsMenu from '@/components/util/DotsMenu.vue'
import ToggleItem from '@/components/util/ToggleItem.vue'
import BuilderChip from './BuilderChip.vue'

export default Vue.extend({
  name: 'QuestionHeader',
  inject: { builder },
  components: { EditText, MenuSelect, DotsMenu, ToggleItem, BuilderChip },
  props: {
    value: Object as PropType<Question>,
    loading: Boolean,
    showParameters: Boolean,
    showConditions: Boolean,
    showChoices: Boolean,
    allowChoices: Boolean,
  },
  methods: {
    updateQuestionType (typeId: string) {
      this.value.questionTypeId = typeId
      this.$emit('change', this.value)
    },
    updateVarName (varName: string) {
      this.value.varName = varName
      this.$emit('change', this.value)
    },
  },
  computed: {
    conditionTagNames (): string {
      return this.value.assignConditionTags.map(act => act.conditionTag ? act.conditionTag.name : 'Unknown').join('","')
    },
  },
})
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import builder from '@/services/builder'
import ParameterRow, { ValidParameter } from './ParameterRow.vue'
import QuestionParameter from '@/entities/trellis/QuestionParameter'
import Choice from '@/entities/trellis/Choice'
import ConditionTag from '@/entities/trellis/ConditionTag'
import GeoType from '@/entities/trellis/GeoType'
import Locale from '@/entities/trellis/Locale'
import Parameter from '@/entities/trellis/Parameter'
import { logError } from '@/helpers/log.helper'
import { QuestionTypeParameters } from '@/static/question.types'

const props = defineProps<{
  disabled?: boolean
  value: QuestionParameter[]
  parameters: Parameter[]
  conditionTags: ConditionTag[]
  choices: Choice[]
  geoTypes: GeoType[]
  questionTypeId: string
  questionId: string
  locale: Locale
}>()

const emit = defineEmits<{
  (event: 'input', value: QuestionParameter[]): void
}>()

const availableParameters = computed(() => {
  const parameters: ValidParameter[] = []
  const validParameters = QuestionTypeParameters[props.questionTypeId]
  for (const p of props.parameters) {
    const par = p as ValidParameter
    par.valid = validParameters.includes(+p.id)
    if (par.valid || props.value.find(qp => qp.parameterId === p.id)) {
      parameters.push(par)
    }
  }
  return parameters
})
const working = ref(false)
const placeholder = ref<QuestionParameter | null>(null)

function add () {
  placeholder.value = new QuestionParameter()
  placeholder.value.questionId = props.questionId
  placeholder.value.val = ''
  placeholder.value.parameterId = availableParameters.value[0].id
}

async function savedPlaceholder (saved: QuestionParameter) {
  emit('input', props.value.concat([saved]))
  placeholder.value = null
}

function updateParameter (index: number, value: QuestionParameter) {
  const v = props.value.slice()
  v[index] = value
  emit('input', v)
}

async function remove (p: QuestionParameter) {
  working.value = true
  try {
    await builder.deleteQuestionParameter(p)
    const index = props.value.indexOf(p)
    const v = props.value.slice()
    v.splice(index, 1)
    emit('input', v)
  } catch (err) {
    logError(err)
  } finally {
    working.value = false
  }
}

</script>

<template>
  <v-col>
    <v-row class="no-gutters align-center">
      <h4>{{ $t('parameters') }}</h4>
      <v-spacer />
      <v-tooltip
        v-if="!disabled"
        left
      >
        <template #activator="{ on, attrs }">
          <v-btn
            @click="add"
            text
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        {{ $t('add_parameter') }}
      </v-tooltip>
    </v-row>
    <v-list>
      <v-list-item
        v-for="(p, index) in props.value"
        :key="p.id"
      >
        <ParameterRow
          :value="props.value[index]"
          @input="updateParameter(index, $event)"
          :parameters="availableParameters"
          :condition-tags="conditionTags"
          :geo-types="geoTypes"
          :choices="choices"
          :locale="locale"
          :disabled="disabled"
          @delete="remove(p)"
        />
      </v-list-item>
      <v-list-item v-if="placeholder">
        <ParameterRow
          v-model="placeholder"
          :parameters="availableParameters"
          :condition-tags="conditionTags"
          :geo-types="geoTypes"
          :choices="choices"
          :disabled="disabled"
          :locale="locale"
          @save="savedPlaceholder"
          @delete="placeholder = null"
        />
      </v-list-item>
    </v-list>
  </v-col>
</template>

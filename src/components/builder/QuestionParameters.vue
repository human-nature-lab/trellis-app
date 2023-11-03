<template>
  <v-col>
    <v-row class="no-gutters align-center">
      <h4>{{ $t('parameters') }}</h4>
      <v-spacer />
      <v-tooltip v-if="!disabled" left>
        <template #activator="{ on, attrs }">
          <v-btn @click="add" text icon v-bind="attrs" v-on="on">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>
        {{ $t('add_parameter') }}
      </v-tooltip>
    </v-row>
    <v-list>
      <v-list-item
        v-for="(p, index) in visibleParameters"
        :key="p.id"
      >
        <ParameterRow
          v-model="visibleParameters[index]"
          :parameters="parameters"
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
          :parameters="parameters"
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

<script lang="ts">
import Vue, { PropType } from 'vue'
import builder from '@/services/builder'
import ParameterRow from './ParameterRow.vue'
import QuestionParameter from '@/entities/trellis/QuestionParameter'
import Choice from '@/entities/trellis/Choice'
import ConditionTag from '@/entities/trellis/ConditionTag'
import GeoType from '@/entities/trellis/GeoType'
import Locale from '@/entities/trellis/Locale'
import Parameter from '@/entities/trellis/Parameter'
import ParameterTypes from '@/static/parameter.types'
import { isBuilderType } from '@/static/question.types'

export default Vue.extend({
  name: 'QuestionParameters',
  props: {
    disabled: Boolean,
    value: Array as PropType<QuestionParameter[]>,
    parameters: Array as PropType<Parameter[]>,
    conditionTags: Array as PropType<ConditionTag[]>,
    choices: Array as PropType<Choice[]>,
    geoTypes: Array as PropType<GeoType[]>,
    questionTypeId: String,
    questionId: String,
    locale: Object as PropType<Locale>,
  },
  components: { ParameterRow },
  data() {
    return {
      working: false,
      placeholder: null as QuestionParameter
    }
  },
  methods: {
    add() {
      this.placeholder = new QuestionParameter()
      this.placeholder.questionId = this.questionId
      this.placeholder.val = ''
      this.placeholder.parameterId = this.parameters[0].id
      console.log(this.placeholder)
    },
    async savedPlaceholder(saved: QuestionParameter) {
      this.$emit('input', this.value.concat([saved]))
      this.placeholder = null
    },
    async remove(p: QuestionParameter) {
      this.working = true
      try {
        await builder.deleteQuestionParameter(p)
        const index = this.value.indexOf(p)
        const v = this.value.slice()
        v.splice(index, 1)
        this.$emit('input', v)
      } catch (err) {
        this.logError(err)
      } finally {
        this.working = false
      }
    },
  },
  computed: {
    visibleParameters (): QuestionParameter[] {
      if (isBuilderType(this.questionTypeId)) {
        return this.value.filter(qp => +qp.parameterId !== ParameterTypes.json)
      }
      return this.value
    },
  },
})
</script>

<style lang="sass">

</style>
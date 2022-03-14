<template>
  <v-col>
    <v-row no-gutters class="align-center">
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
      <v-list-item v-for="(p, index) in value" :key="p.id">
        <ParameterRow
          v-model="value[index]"
          :parameters="parameters"
          :conditionTags="conditionTags"
          :geoTypes="geoTypes"
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
          :conditionTags="conditionTags"
          :geoTypes="geoTypes"
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
import builder from '../../services/builder'
import MenuSelect from './MenuSelect.vue'
import ParameterRow from './ParameterRow.vue'
import QuestionParameter from '../../entities/trellis/QuestionParameter'
import type Choice from '../../entities/trellis/Choice'
import type ConditionTag from '../../entities/trellis/ConditionTag'
import type GeoType from '../../entities/trellis/GeoType'
import type Locale from '../../entities/trellis/Locale'
import type Parameter from '../../entities/trellis/Parameter'
import type QPType from '../../entities/trellis/QuestionParameter'
import Vue, { PropType } from 'vue'

export default Vue.extend({
  name: "QuestionParameters",
  props: {
    disabled: Boolean,
    value: Array as PropType<QPType[]>,
    parameters: Array as PropType<Parameter[]>,
    conditionTags: Array as PropType<ConditionTag[]>,
    choices: Array as PropType<Choice[]>,
    geoTypes: Array as PropType<GeoType[]>,
    questionId: String,
    locale: Object as PropType<Locale>,
  },
  components: { MenuSelect, ParameterRow },
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
  }
})
</script>

<style lang="sass">

</style>
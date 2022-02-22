<template>
  <v-row class="align-center">
    <MenuSelect
      v-model="value.parameterId"
      :items="parameters"
      :disabled="disabled"
      item-text="name"
      item-value="id"
    />
    <v-text-field class="ml-2" v-model="value.val" :label="$t('value')" @change="onChange" />
    <v-menu v-if="!disabled">
      <template #activator="{ attrs, on }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item color="error" @click="$emit('delete')">
          <v-list-action>
            <v-icon>mdi-delete</v-icon>
          </v-list-action>
          {{ $t('delete') }}
        </v-list-item>
      </v-list>
    </v-menu>
  </v-row>
</template>

<script lang="ts">
import Parameter from '../../entities/trellis/Parameter'
import Vue, { PropType } from 'vue'
import QuestionParameter from '../../entities/trellis/QuestionParameter'
import MenuSelect from './MenuSelect.vue'

export default Vue.extend({
  name: 'ParameterRow',
  components: { MenuSelect },
  props: {
    value: Object as PropType<QuestionParameter>,
    parameters: Array as PropType<Parameter[]>,
    disabled: Boolean,
  },
  methods: {
    onChange() {

    }
  }
})
</script>

<style lang="sass">

</style>
<template>
  <v-row no-gutters class="align-center">
    <v-col v-if="!disabled" cols="1">
      <DotsMenu removable @remove="$emit('remove')" :loading="loading" right class-name="page-skip-handle">
        <ToggleItem
          :value="!!value.customLogic"
          @input="toggleCustomLogic"
          :onTitle="$t('hide_custom_logic')"
          :offTitle="$t('show_custom_logic')"
        />
      </DotsMenu>
    </v-col>
    <v-col v-if="!value.customLogic" md="auto" cols="11" class="px-1">
      <MenuSelect
        v-model="value.showHide"
        :items="showOpts"
        :disabled="disabled || loading"
        @change="updateShowHide"
        color="primary lighten-3"
      />
      <span class="mx-1">the page if the respondent has</span>
      <MenuSelect
        v-model="value.anyAll"
        :items="anyOpts"
        :disabled="disabled || loading"
        @change="updateAnyAll"
        color="primary lighten-3"
      />
      <span class="mx-1">of the conditions</span>
      <span v-if="disabled">
        <v-chip
          color="primary lighten-3"
          v-for="condition in selectedConditionTags"
          :key="condition"
          label
        >{{ condition }}</v-chip>
      </span>
    </v-col>
    <v-col v-if="!disabled && !value.customLogic" cols="auto" class="flex-grow-1">
      <v-autocomplete
        :value="selectedConditionTags"
        @change="updateConditionTags"
        :items="conditionTagNames"
        :disabled="loading"
        multiple
        dense
        hide-details
        chips
        color="primary lighten-3"
      />
    </v-col>
    <v-col v-if="value.customLogic">
      <CodeEditor v-model="value.customLogic" @change="updateCustomLogic" :readonly="disabled" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Skip from '../../entities/trellis/Skip'
import Vue, { PropType } from 'vue'
import titleCase from '../../filters/TitleCase'
import MenuSelect from './MenuSelect.vue';
import ConditionTag from '../../entities/trellis/ConditionTag';
import DotsMenu from './DotsMenu.vue';
import ToggleItem from './ToggleItem.vue';
import EditText from './EditText.vue';
import CodeEditor from '../CodeEditor.vue';
import { debounce } from 'lodash';

const defaultLogic = 'function showIf({ vars, tags, data }) {\n  return true;\n}'

export default Vue.extend({
  name: 'SkipRow',
  components: { MenuSelect, DotsMenu, ToggleItem, EditText, CodeEditor },
  filters: { titleCase },
  props: {
    value: Object as PropType<Skip>,
    disabled: Boolean,
    loading: Boolean,
    conditionTags: Array as PropType<ConditionTag[]>,
  },
  data () {
    return {
      emitChangeDebounced: debounce((value: Skip) => {
        this.$emit('change', value)
      }, 500)
    }
  },
  computed: {
    selectedConditionTags(): string[] {
      const r = this.value.conditionTags.map((sct) => sct.conditionTagName)
      r.sort()
      return r
    },
    conditionTagNames(): string[] {
      const r = this.conditionTags.map(c => c.name)
      r.sort()
      return r
    },
    showOpts(): object[] {
      return [{
        text: this.$t('show'),
        value: true,
      }, {
        text: this.$t('hide'),
        value: false,
      }]
    },
    anyOpts(): object {
      return [{
        text: this.$t('any'),
        value: false,
      }, {
        text: this.$t('all'),
        value: true,
      }]
    }
  },
  methods: {
    updateConditionTags(newConds: string[]) {
      this.$emit('changeConditions', this.value, newConds)
    },
    updateShowHide(val: boolean) {
      this.value.showHide = val
      this.$emit('change', this.value)
    },
    updateAnyAll(val: boolean) {
      this.value.anyAll = val
      this.$emit('change', this.value)
    },
    toggleCustomLogic(show: boolean) {
      if (show) {
        this.value.customLogic = defaultLogic
        this.$emit('change', this.value)
      } else {
        if (confirm(this.$t('delete_custom_logic_confirm'))) {
          this.value.customLogic = null
          this.$emit('change', this.value)
        }
      }
    },
    updateCustomLogic (newVal: string) {
      this.value.customLogic = newVal
      this.emitChangeDebounced(this.value)
    },
  }
})
</script>

<style lang="sass">

</style>
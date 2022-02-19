<template>
  <v-row no-gutters class="align-center">
    <MenuSelect v-model="value.showHide" :items="showOpts" :disabled="disabled" />
    <span class="mx-1">the page if the respondent has</span>
    <MenuSelect v-model="value.anyAll" :items="anyOpts" :disabled="disabled" />
    <span class="mx-1">of the conditions</span>
    <v-chip
      color="primary lighten-3"
      v-for="condition in selectedConditionTags"
      :key="condition"
      label
    >{{ condition }}</v-chip>
  </v-row>
</template>

<script lang="ts">
import Skip from '../../entities/trellis/Skip'
import Vue, { PropType } from 'vue'
import { builder } from '../../symbols/builder';
import titleCase from '../../filters/TitleCase'
import MenuSelect from './MenuSelect.vue';

export default Vue.extend({
  name: 'SkipRow',
  components: { MenuSelect },
  inject: { builder },
  filters: { titleCase },
  props: {
    value: Object as PropType<Skip>,
    disabled: Boolean,
  },
  computed: {
    selectedConditionTags(): string[] {
      return this.value.conditionTags.map((sct) => sct.conditionTagName);
    },
    showOpts(): object[] {
      return [{
        title: this.$t('show'),
        value: true,
      }, {
        title: this.$t('hide'),
        value: false,
      }]
    },
    anyOpts(): object {
      return [{
        title: this.$t('any'),
        value: false,
      }, {
        title: this.$t('all'),
        value: true,
      }]
    }
  }
})
</script>

<style lang="sass">

</style>
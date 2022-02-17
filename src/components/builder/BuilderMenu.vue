<template>
  <v-menu>
    <template #activator="{ attrs, on }">
      <v-btn v-bind="attrs" v-on="on" icon flat>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click="$emit('addSection')">{{ $t('add_section') }}</v-list-item>
      <v-list-item @click="openLocales = true">{{ $t('change_locale') }}</v-list-item>
    </v-list>
    <TrellisModal v-model="openLocales" :title="$t('change_locale')">
      <LocaleSelector :studyId="builder.studyId" />
    </TrellisModal>
  </v-menu>
</template>

<script lang="ts">
  import BuilderMixin from '../../mixins/BuilderMixin'
import Vue from 'vue'
  import LocaleSelector from '../locale/LocaleSelector.vue'
  import TrellisModal from '../TrellisModal.vue'

  export default Vue.extend({
    name: "BuilderMenu",
    mixins: [BuilderMixin],
    components: { LocaleSelector, TrellisModal },
    data () {
      return {
        openLocales: false,
      }
    }
})
</script>

<style lang="sass">
  
</style>
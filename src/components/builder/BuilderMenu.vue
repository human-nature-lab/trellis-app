<template>
  <span>
    <v-menu>
      <template #activator="{ attrs, on }">
        <v-btn v-bind="attrs" v-on="on" icon text>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="$emit('update:locked', !locked)">
          <v-list-item-action>
            <v-icon v-if="locked">mdi-lock</v-icon>
            <v-icon v-else>mdi-lock-open-variant</v-icon>
          </v-list-item-action>
          {{ locked ? $t('locked') : $t('unlocked') }}
        </v-list-item>
        <v-list-item @click="$emit('addSection')">
          <v-list-item-action>
            <v-icon>mdi-plus</v-icon>
          </v-list-item-action>
          {{ $t('add_section') }}
        </v-list-item>
        <LocaleSelectorMenu :value="locale" @input="updateLocale" :studyId="study.id">
          <template #activator="{ attrs, on }">
            <v-list-item v-bind="attrs" v-on="on">
              <v-list-item-action>
                <v-icon>mdi-web</v-icon>
              </v-list-item-action>
              {{ $t('change_locale') }}
            </v-list-item>
          </template>
        </LocaleSelectorMenu>
        <v-list-item @click="$emit('refresh')">
          <v-list-item-action>
            <v-icon>mdi-refresh</v-icon>
          </v-list-item-action>
          {{ $t('refresh') }}
        </v-list-item>
      </v-list>
    </v-menu>
  </span>
</template>

<script lang="ts">
import { study } from '../../symbols/main'
import Vue, { PropType } from 'vue'
import Locale from '../../entities/trellis/Locale'
import LocaleSelectorMenu from '../locale/LocaleSelectorMenu.vue'

export default Vue.extend({
  name: "BuilderMenu",
  inject: { study },
  components: { LocaleSelectorMenu },
  props: {
    locked: Boolean,
    locale: Object as PropType<Locale>,
  },
  data() {
    return {
      openLocales: false,
    }
  },
  methods: {
    updateLocale(newLocale: Locale) {
      console.log('update locale', newLocale)
      this.$emit('update:locale', newLocale)
    }
  }
})
</script>

<style lang="sass">

</style>
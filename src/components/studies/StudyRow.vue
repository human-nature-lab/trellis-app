<template>
  <tr>
    <td>
      <v-menu
        offset-x
        max-width="60px"
        lazy>
        <v-btn icon slot="activator">
          <v-icon>more_vert</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile @click="$emit('edit')">
            <v-icon>edit</v-icon>
          </v-list-tile>
          <v-list-tile @click="$emit('remove')">
            <v-icon color="error">delete</v-icon>
          </v-list-tile>
        </v-list>
      </v-menu>
    </td>
    <td>{{study.name}}</td>
    <td>{{study.photoQuality}}%</td>
    <td>
      <v-select
        dense
        chips
        deletable-chips
        multiple
        autocomplete
        :loading="!locales.length || isWorking"
        v-model="study.locales"
        @change="updateLocales"
        item-text="languageName"
        item-value="id"
        return-object
        single-line
        :items="locales" />
    </td>
    <td>{{study.defaultLocale.languageName}}</td>
  </tr>
</template>

<script lang="ts">
  import Vue from 'vue'
  import Locale from '../../entities/trellis/Locale'
  import Study from '../../entities/trellis/Study'
  import StudyLocale from "../../entities/trellis/StudyLocale"
  import LocaleService from "../../services/locale/LocaleService"
  export default Vue.extend({
    name: 'StudyRow',
    props: {
      study: {
        type: Object as () => Study,
        required: true
      },
      locales: {
        type:  Array as () => Locale[],
        required: true
      }
    },
    data () {
      return {
        isWorking: false
      }
    },
    methods: {
      updateLocales (newLocales) {
        if (newLocales.length > this.study.locales.length) {
          // Add
          this.addStudyLocale(newLocales[newLocales.length - 1])
        } else {
          // Remove
          for (const locale of this.study.locales) {
            const i = newLocales.findIndex(l => l.id === locale.id)
            if (i === -1) {
              return this.removeStudyLocale(locale)
            }
          }
          this.alert('error', 'Unable to remove locale', {timeout: 0})
        }
      },
      compareLocales (one, two): boolean {
        return one.id === two.id
      },
      async addStudyLocale (locale: Locale) {
        try {
          this.isWorking = true
          const studyLocale: StudyLocale = await LocaleService.addStudyLocale(this.study.id, locale)
          this.alert('success', this.$t('resource_updated', [this.study.name]))
        } catch (err) {
          this.log(err)
          this.alert('error', 'Unable to add study locale', {timeout: 0})
        } finally {
          this.isWorking = false
        }
      },
      async removeStudyLocale (locale: Locale) {
        try {
          this.isWorking = true
          await LocaleService.removeStudyLocale(this.study.id, locale)
        } catch (err) {
          this.log(err)
          this.alert('error', 'Unable to remove study locale', {timeout: 0})
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>

<style scoped>

</style>

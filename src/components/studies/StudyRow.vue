<template>
  <tr>
    <td>
      <CRUDMenu
        :editable="hasPermission(TrellisPermission.EDIT_STUDY)"
        :removable="hasPermission(TrellisPermission.REMOVE_STUDY)"
        @edit="$emit('edit')"
        @remove="$emit('remove')" />
    </td>
    <td>{{study.name}}</td>
    <td>{{study.photoQuality}}%</td>
    <td>
      <v-autocomplete
        dense
        chips
        deletable-chips
        multiple
        :readonly="!hasPermission(TrellisPermission.EDIT_STUDY)"
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
  import StudyLocale from '../../entities/trellis/StudyLocale'
  import PermissionMixin from '../../mixins/PermissionMixin'
  import LocaleService from '../../services/locale/LocaleService'
  import CRUDMenu from '../CRUDMenu'
  export default Vue.extend({
    name: 'StudyRow',
    mixins: [PermissionMixin],
    components: { CRUDMenu },
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
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Unable to add study locale')
          }
        } finally {
          this.isWorking = false
        }
      },
      async removeStudyLocale (locale: Locale) {
        try {
          this.isWorking = true
          await LocaleService.removeStudyLocale(this.study.id, locale)
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err, 'Unable to remove study locale')
          }
        } finally {
          this.isWorking = false
        }
      }
    }
  })
</script>

<style scoped>

</style>

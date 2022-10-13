<template>
  <v-menu offset-y right v-model="isOpen">
    <template #activator="{ on, attrs }">
      <v-btn icon v-on="on" v-bind="attrs" :disabled="isBusy">
        <v-progress-circular v-if="isBusy" indeterminate />
        <v-icon v-else>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list>
      <Permission :requires="TrellisPermission.EDIT_FORM">
        <v-list-item
          :to="{
            name: 'FormBuilder',
            params: { formId: form.id, mode: 'builder' },
          }"
          :disabled="!isTestStudy"
        >
          <v-list-item-content>Edit</v-list-item-content>
        </v-list-item>
      </Permission>
      <Permission :requires="TrellisPermission.EDIT_FORM">
        <v-list-item
          @click="$emit('toggleFormSkips', studyForm.form)"
          :disabled="!isTestStudy"
        >
          <v-list-item-content>
            {{ $t("edit_skips") }}
          </v-list-item-content>
        </v-list-item>
      </Permission>
      <Permission :requires="TrellisPermission.EDIT_FORM">
        <v-list-item @click="$emit('publish', form)" :disabled="!isTestStudy">
          <v-list-item-content>
            {{ $t("publish_form") }}
          </v-list-item-content>
        </v-list-item>
      </Permission>
      <Permission :requires="TrellisPermission.EDIT_FORM">
        <v-list-item @click="$emit('update:isPublished', !form.isPublished)" :disabled="isTestStudy">
          <v-list-item-content v-if="form.isPublished">
            {{ $t('disable_form') }}
          </v-list-item-content>
          <v-list-item-content v-else>
            {{ $t('enable_form') }}
          </v-list-item-content>
          <v-list-item-action>
            <v-switch v-model="form.isPublished" :disabled="isTestStudy" color="success" />
          </v-list-item-action>
        </v-list-item>
      </Permission>
      <Permission :requires="TrellisPermission.EDIT_FORM">
        <v-list-item @click="$emit('revert', form)" :disabled="isTestStudy">
          <v-list-item-content>
            {{ $t('revert_version') }}
          </v-list-item-content>
        </v-list-item>
      </Permission>
      <Permission v-if="!isTestStudy" :requires="TrellisPermission.EDIT_FORM">
        <v-list-item @click.stop.capture="toggleAllowMultipleResponses">
          <v-list-item-content>
            {{ $t('allow_multiple_responses') }}
          </v-list-item-content>
          <v-list-item-action>
            <v-switch v-model="allowMultipleResponses" color="success" />
          </v-list-item-action>
        </v-list-item>
      </Permission>
      <v-list-item
        :to="{ name: 'InterviewPreview', params: { formId: form.id } }"
      >
        <v-list-item-content>{{ $t('preview_form') }}</v-list-item-content>
      </v-list-item>
      <!--v-list-item :to="{name: 'FormBuilder', params: {formId: form.id, mode: 'print'}}">
          <v-list-item-content>
            Print
          </v-list-item-content>
        </v-list-item-->
      <v-list-item @click="$emit('export', form)">
        <v-list-item-content>{{ $t('export_form') }} </v-list-item-content>
      </v-list-item>
      <v-list-item :to="{ name: 'FormPrint', params: { formId: form.id } }" target="_blank">
        <v-list-item-content>
          {{ $t('print_form') }}
        </v-list-item-content>
      </v-list-item>
      <Permission :requires="TrellisPermission.REMOVE_FORM">
        <v-list-item @click="$emit('delete', form)">
          <v-list-item-content>
            <span color="error--text">
              {{ $t('delete') }}
            </span>
          </v-list-item-content>
        </v-list-item>
      </Permission>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
  import Vue, { PropOptions } from 'vue'
  import Form from '../../entities/trellis/Form'
  import StudyForm from '../../entities/trellis/StudyForm'
  import PermissionMixin from '../../mixins/PermissionMixin'
  import Permission from '../Permission.vue'
  import FormService from '../../services/form'

  export default Vue.extend({
    name: 'FormActions',
    mixins: [PermissionMixin],
    components: {
      Permission,
    },
    props: {
      isBusy: {
        type: Boolean,
        default: false,
      },
      form: <PropOptions<Form>>{
        type: Object,
        required: true,
      },
      studyForm: <PropOptions<StudyForm>>{
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        isOpen: false,
      }
    },
    methods: {
      async toggleAllowMultipleResponses () {
        const sf = this.studyForm.copy()
        sf.allowMultipleResponses = !sf.allowMultipleResponses
        this.$emit('update:studyForm', sf)
        await FormService.updateStudyForm(sf.studyId, sf)
      }
    },
    computed: {
      allowMultipleResponses (): boolean {
        return this.studyForm.allowMultipleResponses
      }
    }
  })
</script>

<style lang="sass" scoped>
  .list__tile__title
    line-height: 30px
</style>
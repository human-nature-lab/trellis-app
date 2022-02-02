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
        <v-list-item @click="$emit('revert', form)" :disabled="isTestStudy">
          <v-list-item-content>
            {{ $t('revert_version') }}
          </v-list-item-content>
        </v-list-item>
      </Permission>
      <v-list-item
        :to="{ name: 'InterviewPreview', params: { formId: form.id } }"
      >
        <v-list-item-content>Preview</v-list-item-content>
      </v-list-item>
      <!--v-list-item :to="{name: 'FormBuilder', params: {formId: form.id, mode: 'print'}}">
          <v-list-item-content>
            Print
          </v-list-item-content>
        </v-list-item-->
      <v-list-item @click="$emit('export', form)">
        <v-list-item-content>Export</v-list-item-content>
      </v-list-item>
      <Permission :requires="TrellisPermission.REMOVE_FORM">
        <v-list-item @click="$emit('delete', form)">
          <v-list-item-content>
            <span color="error--text">Delete</span>
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
  })
</script>
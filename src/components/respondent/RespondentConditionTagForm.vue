<template>
  <v-container fluid>
    <v-alert v-if="error">
      {{error}}
    </v-alert>
    <v-layout row>
      <v-select
        autofocus
        autocomplete
        v-model="conditionTag"
        :loading="isLoading"
        item-text="name"
        append-icon="add"
        :append-icon-cb="newConditionTag"
        :items="conditions" />
      <v-btn @click="save">
        <v-progress-circular v-if="isSaving" indeterminate />
        <span v-else>
          {{ $t('save') }}
        </span>
      </v-btn>
    </v-layout>
    <v-dialog v-model="showNewConditionTag" max-width="300">
      <v-card>
        <v-container>
          <v-layout row>
            <v-text-field
              autofocus
              :loading="isSavingNew"
              v-model="newConditionTagName"
              :label="$t('condition_tag')" />
            <v-btn @click="createNewConditionTag">
              <v-progress-circular
                v-if="isSavingNew"
                indeterminate />
              <span v-else>
                {{ $t('save') }}
              </span>
            </v-btn>
          </v-layout>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import ConditionTagService from '../../services/condition-tag'
  export default {
    name: 'respondent-condition-form',
    data: () => ({
      conditionTag: null,
      conditions: [],
      isLoading: false,
      isSaving: false,
      isSavingNew: false,
      newConditionTagName: null,
      showNewConditionTag: false,
      error: null
    }),
    created () {
      this.load()
    },
    props: {
      respondentId: {
        type: String,
        required: true
      }
    },
    methods: {
      load () {
        this.isLoading = true
        ConditionTagService.all().then(conditions => {
          this.conditions = conditions
        }).catch(err => {
          this.error = err
        }).finally(() => {
          this.isLoading = false
        })
      },
      save () {
        this.isSaving = true
        ConditionTagService.createRespondentConditionTag(this.respondentId, this.conditionTag.id).then(tag => {
          tag.conditionTag = this.conditionTag.copy()
          this.$emit('close', tag)
          this.conditionTag = null
        }).catch(err => {
          this.error = err
        }).finally(() => {
          this.isSaving = false
        })
      },
      createNewConditionTag () {
        this.isSavingNew = true
        ConditionTagService.createConditionTag(this.newConditionTagName).then(tag => {
          this.conditions.push(tag)
          this.conditionTag = tag
        }).catch(err => {
          this.error = err
        }).finally(() => {
          this.isSavingNew = false
          this.showNewConditionTag = false
        })
      },
      newConditionTag () {
        this.showNewConditionTag = true
      }
    }
  }
</script>

<style scoped>

</style>

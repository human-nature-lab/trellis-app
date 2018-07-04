<template>
  <v-container>
    <v-layout>
      <v-text-field
        label="Respondent name"
        v-model="name"/>
    </v-layout>
    <v-layout>
      <v-btn @click="save()">
        <v-progress-circular v-if="isSaving"/>
        <span v-else>Save</span>
      </v-btn>
    </v-layout>
  </v-container>
</template>

<script>
  import RespondentService from '../../services/respondent/RespondentService'
  export default {
    name: 'add-respondent-form',
    props: {
      associatedRespondentId: String,
      studyId: String
    },
    data () {
      return {
        name: '',
        geoId: null,
        isSaving: false
      }
    },
    methods: {
      save () {
        this.isSaving = true
        RespondentService.createRespondent(this.studyId, this.name, this.geoId, this.associatedRespondentId)
        .then(respondent => {
          this.$emit('close', respondent)
        }).catch(err => {
          this.error = err
        }).finally(() => { this.isSaving = false })
      }
    }
  }
</script>

<style scoped>

</style>

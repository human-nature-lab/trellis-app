<template>
    <v-dialog
      v-model="isOpen">
      <v-card>
        <v-container fluid>
          <h4>{{message}}</h4>
          <v-progress-linear indeterminate />
        </v-container>
      </v-card>
    </v-dialog>
</template>

<script >
  import CensusFormService from '../services/census'

  let vm
  export function checkForCensusForm (censusTypeId, studyId, respondentId) {
    return new Promise((resolve, reject) => {
      vm.resolve = resolve
      vm.reject = reject
      if (!vm) {
        throw new Error('Component must be registered in DOM before using this function')
      }
      vm.censusTypeId = censusTypeId
      vm.studyId = studyId
      vm.respondentId = respondentId
      vm.isOpen = true
      return vm.check()
    })
  }

  export default {
    name: 'CensusFormChecker',
    data () {
      return {
        isOpen: false,
        censusTypeId: null,
        studyId: null,
        respondentId: null,
        message: '',
        resolve: null,
        reject: null
      }
    },
    created () {
      vm = this
    },
    methods: {
      async check () {
        this.isOpen = true
        this.message = this.$t('checking_census_form')
        try {
          const hasCensusForm = await CensusFormService.hasCensusForm(this.studyId, this.censusTypeId)
          if (hasCensusForm) {
            this.resolve(true)
            this.$nextTick(() => {
              CensusFormService.redirectToCensusForm(this.studyId, this.censusTypeId, this.respondentId)
            })
          } else {
            this.resolve(false)
            this.message = this.$t('no_census_defined_for_study')
          }
        } catch (err) {
          if (this.isNotAuthError(err)) {
            this.logError(err)
          }
          this.reject(err)
        } finally {
          this.isOpen = false
        }
      }
    }
  }
</script>
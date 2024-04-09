<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StudyService from '../services/study'
import { isTestStudy } from '@/helpers/singleton.helper'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError } from '@/helpers/log.helper'

const emit = defineEmits<{
  (event: 'change', study: any): void
}>()

const error = ref(null)
const studies = ref([])
const study = ref(null)
const isWorking = ref(false)
const showCreateStudy = ref(false)

function getStudyById (studyId) {
  for (let i = 0; i < studies.value.length; i++) {
    if (studies.value[i].id === studyId) {
      return studies.value[i]
    }
  }
  return null
}

function change (studyId) {
  const study = getStudyById(studyId)
  study.value = study
  StudyService.setCurrentStudy(study)
  emit('change', study)
}

async function load () {
  try {
    isWorking.value = true
    study.value = StudyService.getCurrentStudy()
    studies.value = await StudyService.getMyStudies(isTestStudy.value)
    studies.value.sort(function (a, b) {
      return b.name.localeCompare(a.name)
    })
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err, 'Failed to load studies')
    }
  } finally {
    isWorking.value = false
    if (studies.value.length === 0) showCreateStudy.value = true
  }
}

onMounted(() => {
  load()
})
// export default {
//   name: 'StudySelector',
//   data () {
//     return {
//       error: null,
//       studies: [],
//       study: null,
//       isWorking: false,
//       showCreateStudy: false,
//     }
//   },
//   created () {
//     this.load()
//   },
//   methods: {
//     change (studyId) {
//       const study = this.getStudyById(studyId)
//       this.study = study
//       StudyService.setCurrentStudy(study)
//       this.$emit('change', study)
//     },
//     async load () {
//       try {
//         this.isWorking = true
//         this.study = await StudyService.getCurrentStudy()
//         this.studies = await StudyService.getMyStudies()
//         this.studies.sort(function (a, b) {
//           return b.name.localeCompare(a.name)
//         })
//       } catch (err) {
//         if (this.isNotAuthError(err)) {
//           this.logError(err, 'Failed to load studies')
//         }
//       } finally {
//         this.isWorking = false
//         if (this.studies.length === 0) this.showCreateStudy = true
//       }
//     },
//     getStudyById (studyId) {
//       for (let i = 0; i < this.studies.length; i++) {
//         if (this.studies[i].id === studyId) {
//           return this.studies[i]
//         }
//       }
//       return null
//     },
//   },
// }
</script>

<template>
  <v-flex>
    <debug name="Studies">
      <pre>{{ studies }}</pre>
    </debug>
    <v-alert
      color="error"
      v-if="error"
    >
      {{ error }}
    </v-alert>
    <v-alert
      color="info"
      v-show="showCreateStudy"
    >
      There are no studies set up, go to
      <router-link to="Studies">
        Studies
      </router-link> to create your first study.
    </v-alert>
    <v-select
      :label="$t('study')"
      :loading="isWorking"
      v-model="study"
      @change="change"
      item-text="name"
      item-value="id"
      :items="studies"
    />
  </v-flex>
</template>

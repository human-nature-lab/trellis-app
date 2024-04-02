<script lang="ts" setup>import { ref, watch } from 'vue'
import TrellisModal from '../TrellisModal.vue'
import ConditionTagService from '../../services/condition-tag'
import RespondentConditionTag from '@/entities/trellis/RespondentConditionTag'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError } from '@/helpers/log.helper'


const props = defineProps<{
  value: boolean
  respondentId: string
}>()

const emit = defineEmits<{
  (event: 'input', value: boolean): void
  (event: 'close', respondentConditionTag: RespondentConditionTag): void
}>()

const conditionTagName = ref('')
const conditions = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const hasLoaded = ref(false)

async function load () {
  isLoading.value = true
  try {
    conditions.value = await ConditionTagService.getRespondentConditionTagNames()
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err)
    }
  } finally {
    isLoading.value = false
  }
}

watch(() => props.value, async value => {
  if (value && !hasLoaded.value) {
    await load()
    hasLoaded.value = true
  }
}, { immediate: true })

async function save () {
  if (conditionTagName.value.trim() === '') return
  isSaving.value = true
  try {
    const newConditionTag = await ConditionTagService.createConditionTag(conditionTagName.value.trim())
    const respondentConditionTag = await ConditionTagService.createRespondentConditionTag(props.respondentId, newConditionTag.id)
    respondentConditionTag.conditionTag = newConditionTag.copy()
    emit('close', respondentConditionTag)
    conditionTagName.value = ''
  } catch (err) {
    if (isNotAuthError(err)) {
      logError(err)
    }
  } finally {
    isSaving.value = false
  }
}
// export default {
//   components: { TrellisModal },
//   name: 'respondent-condition-form',
//   data: () => ({
//     conditionTagName: '',
//     conditions: [],
//     isLoading: false,
//     isSaving: false
//   }),
//   created () {
//     this.load()
//   },
//   props: {
//     value: {
//       type: Boolean,
//       required: true
//     },
//     respondentId: {
//       type: String,
//       required: true
//     }
//   },
//   methods: {
//     async load () {
//       this.isLoading = true
//       try {
//         this.conditions = await ConditionTagService.getRespondentConditionTagNames()
//       } catch (err) {
//         if (this.isNotAuthError(err)) {
//           this.logError(err)
//         }
//       } finally {
//         this.isLoading = false
//       }
//     },
//     async save () {
//       if (this.conditionTagName.trim() === '') return
//       this.isSaving = true
//       try {
//         const newConditionTag = await ConditionTagService.createConditionTag(this.conditionTagName.trim())
//         const respondentConditionTag = await ConditionTagService.createRespondentConditionTag(this.respondentId, newConditionTag.id)
//         respondentConditionTag.conditionTag = newConditionTag.copy()
//         this.$emit('close', respondentConditionTag)
//         this.conditionTagName = ''
//       } catch (err) {
//         if (this.isNotAuthError(err)) {
//           this.logError(err)
//         }
//       } finally {
//         this.isSaving = false
//       }
//     },
//   }
// }
</script>
<template>
  <TrellisModal
    :value="value"
    @input="$emit('input', $event)"
    :title="$t('add_condition_tag')"
  >
    <v-card>
      <v-card-text>
        <v-row class="no-gutters">
          <v-combobox
            autofocus
            v-model="conditionTagName"
            :loading="isLoading"
            :items="conditions"
          />
          <v-btn
            @click="save"
          >
            <v-progress-circular
              v-if="isSaving"
              indeterminate
            />
            <span v-else>
              {{ $t('save') }}
            </span>
          </v-btn>
        </v-row>
      </v-card-text>
    </v-card>
  </TrellisModal>
</template>

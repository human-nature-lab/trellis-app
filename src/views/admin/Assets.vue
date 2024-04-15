<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Asset from '@/entities/trellis/Asset'
import AssetService from '@/services/asset'
import { isNotAuthError } from '@/helpers/auth.helper'
import { logError } from '@/helpers/log.helper'
import TrellisFileUpload from '@/components/import/TrellisFileUpload.vue'
import { i18n } from '@/i18n'
import { relativeTime } from '@/filters/date'
import FormatBytes from '@/filters/format-bytes.filter'
import saveAs from 'file-saver'

const assets = ref<Asset[]>([])
const loading = ref(false)
const showUpload = ref(false)
const search = ref('')
const tableHeaders = computed(() => [{
  text: i18n.t('filename'),
  value: 'fileName',
}, {
  text: i18n.t('size'),
  value: 'size',
}, {
  text: i18n.t('file_type'),
  value: 'type',
}, {
  text: i18n.t('mime_type'),
  value: 'mimeType',
}, {
  text: i18n.t('should_sync'),
  value: 'shouldSync',
}, {
  text: i18n.t('created_at'),
  value: 'createdAt',
}, {
  text: '',
  value: 'actions',
}])

async function fetchAssets () {
  if (loading.value) return
  loading.value = true
  try {
    assets.value = await AssetService.listAssets()
  } catch (e) {
    if (isNotAuthError(e)) {
      logError(e)
    }
  } finally {
    loading.value = false
  }
}

async function createAssets (file: File) {
  if (loading.value) return
  loading.value = true
  try {
    const data = {
      fileName: file.name,
      shouldSync: false,
    }
    const asset = await AssetService.createAsset(data, file)
    assets.value.push(asset)
  } catch (e) {
    logError(e)
    throw e
  } finally {
    loading.value = false
  }
}

async function uploadFile (file: File) {
  await createAssets(file)
}

async function downloadAsset (asset: Asset) {
  if (loading.value) return
  loading.value = true
  try {
    const data = await AssetService.getAsset(asset.id)
    saveAs(data, asset.fileName)
  } catch (e) {
    logError(e)
  } finally {
    loading.value = false
  }
}

async function deleteAsset (asset: Asset) {
  if (loading.value) return
  loading.value = true
  try {
    if (!confirm(i18n.t('confirm_delete') as string)) return
    await AssetService.deleteAsset(asset.id)
    assets.value = assets.value.filter((a) => a.id !== asset.id)
  } catch (e) {
    logError(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAssets()
})
</script>

<template>
  <v-col>
    <h3>{{ $t('assets') }}</h3>
    <v-text-field
      v-model="search"
      :placeholder="$t('search')"
    />
    <v-btn
      @click="showUpload = true"
      icon
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-data-table
      :items="assets"
      :loading="loading"
      :search="search"
      :headers="tableHeaders"
    >
      <template #item.size="{ item }">
        {{ FormatBytes(item.size) }}
      </template>
      <template #item.createdAt="{ item }">
        {{ relativeTime(item.createdAt) }}
      </template>
      <template #item.actions="{ item }">
        <v-row class="no-gutters actions flex-nowrap">
          <v-btn
            @click="downloadAsset(item)"
            icon
            :disabled="loading"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
          <v-btn
            @click="deleteAsset(item)"
            icon
            :disabled="loading"
            color="error"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-row>
      </template>
    </v-data-table>
    <TrellisFileUpload
      v-model="showUpload"
      :upload-file="uploadFile"
    />
  </v-col>
</template>

<style lang="sass" scoped>
tr:hover
  .actions
    visibility: visible
.actions
  visibility: hidden
</style>

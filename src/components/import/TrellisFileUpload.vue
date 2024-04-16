<template>
  <TrellisModal
    :title="title"
    :max-width="800"
    :persistent="isUploading"
    v-bind="$attrs"
    v-on="$listeners"
    @close="onClose"
  >
    <template
      #activator="{ on, attrs }"
      v-if="showButton"
    >
      <v-btn
        v-bind="attrs"
        v-on="on"
      >
        <slot>
          {{ title }}
        </slot>
      </v-btn>
    </template>
    <slot name="header" />
    <v-col class="upload">
      <v-row
        class="dropzone justify-space-around"
        :class="{dragover: isDragging, dense: files.length, disabled: isUploading, invalid: isInvalid }"
        @click="$refs.fileInput.click()"
        @dragover.stop.prevent="dragover"
        @dragend.stop.prevent="dragend"
        @dragleave.stop.prevent="dragleave"
        @dragenter.stop.prevent="dragenter"
        @drop.stop.prevent="onDrop"
      >
        <slot name="dropzone">
          <v-col class="justify-space-around text-center">
            <h5 class="text-h5">
              {{ $t('dropzone') }}
            </h5>
            <div v-if="accept">
              {{ accept }}
            </div>
          </v-col>
        </slot>
      </v-row>
      <v-row v-if="files.length">
        <v-col>
          <v-simple-table>
            <thead>
              <tr>
                <th>{{ $t('status') }}</th>
                <th>{{ $t('filename') }}</th>
                <th>{{ $t('filesize') }}</th>
                <th>{{ $t('type') }}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="file in files"
                :key="file.name"
              >
                <td>
                  <v-icon
                    v-if="file.status === 'uploaded'"
                    color="success"
                    @click="visibleResponse = file.response"
                  >
                    mdi-check
                  </v-icon>
                  <v-icon
                    v-if="file.status === 'failed'"
                    color="error"
                    @click="visibleError = file.error"
                  >
                    mdi-alert-circle-outline
                  </v-icon>
                  <v-progress-circular
                    v-else-if="file.status === 'uploading' "
                    color="warning"
                    indeterminate
                    small
                  />
                </td>
                <td>{{ file.name }}</td>
                <td>{{ file.size | formatBytes }}</td>
                <td>{{ file.type }}</td>
                <td>
                  <v-icon
                    small
                    @click="removeFile(file)"
                  >
                    mdi-delete
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-col>
      </v-row>
      <v-row class="mt-8">
        <v-spacer />
        <v-btn
          v-if="isUploading"
          @click="cancel"
          color="warning"
        >
          <slot name="cancel">
            {{ $t('cancel') }}
          </slot>
        </v-btn>
        <v-btn
          v-else
          @click="upload"
          color="success"
          :disabled="!files.length"
        >
          <slot name="upload">
            {{ $t('upload') }}
          </slot>
          <v-icon class="ml-2">
            mdi-upload
          </v-icon>
        </v-btn>
      </v-row>
    </v-col>
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      :multiple="multiple"
      @change="onChange"
    >
    <TrellisModal
      :title="$t('error')"
      :value="!!visibleError"
      @input="visibleError = null"
      :max-width="500"
    >
      <v-col v-if="visibleError">
        <slot
          name="error"
          :error="visibleError"
        >
          <div v-if="axiosResponse">
            {{ visibleError.response.data }}
          </div>
          <div v-else>
            {{ visibleError }}
          </div>
        </slot>
      </v-col>
    </TrellisModal>
    <TrellisModal
      :title="$t('success')"
      :value="!!visibleResponse"
      @input="visibleResponse = null"
    >
      <v-col v-if="visibleResponse">
        <slot
          name="response"
          :response="visibleResponse"
        >
          {{ visibleResponse }}
        </slot>
      </v-col>
    </TrellisModal>
  </TrellisModal>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
import TrellisModal from '../TrellisModal.vue'
import formatBytes from '../../filters/format-bytes.filter'

type UFile = File & { status: 'uploaded' | 'uploading' | 'failed', error: any, response: any }

export default Vue.extend({
  name: 'TrellisFileUpload',
  components: { TrellisModal },
  filters: { formatBytes },
  props: {
    title: String,
    uploadFile: Function,
    extensions: {
      type: Array,
      required: false,
    } as PropOptions<string[]>,
    multiple: {
      type: Boolean,
      default: false,
    },
    axiosResponse: {
      type: Boolean,
      default: false,
    },
    showButton: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      files: [] as UFile[],
      isInvalid: false,
      isDragging: false,
      isUploading: false,
      visibleError: null,
      visibleResponse: null,
    }
  },
  methods: {
    async upload () {
      this.isUploading = true
      for (const file of this.files) {
        if (this.isUploading && file.status !== 'uploaded') {
          await this.uploadOne(file)
        }
      }
      this.isUploading = false
    },
    async uploadOne (file: UFile) {
      try {
        file.status = 'uploading'
        this.$forceUpdate()
        file.response = await this.uploadFile(file)
        file.status = 'uploaded'
      } catch (err) {
        console.error(err)
        console.dir(err)
        file.status = 'failed'
        file.error = err
      }
      this.$forceUpdate()
    },
    cancel () {
      this.isUploading = false
    },
    dragover (event: Event) {
      // @ts-ignore
      const files: File[] = event.dataTransfer.files
      for (const file of files) {
        if (!this.canAcceptFile(file)) {
          this.isInvalid = true
          break
        }
      }
    },
    dragleave () {
      this.isInvalid = false
    },
    onDrop (event: Event) {
      if (this.isUploading || this.isInvalid) {
        return
      }
      this.isDragging = false
      // @ts-ignore
      const files: File[] = event.dataTransfer.files
      if (!this.multiple && files.length > 1) {
        this.alert('warning', 'Cannot upload multiple files')
        return
      }
      for (const file of files) {
        if (this.canAcceptFile(file)) {
          this.files.push(file as UFile)
        }
      }
    },
    onChange (event: Event) {
      // @ts-ignore
      const files: File[] = this.$refs.fileInput.files
      for (const file of files) {
        this.files.push(file as UFile)
      }
    },
    onClose () {
      this.files = []
      this.$emit('close')
    },
    removeFile (file: UFile) {
      const index = this.files.indexOf(file)
      this.files.splice(index, 1)
    },
    canAcceptFile (file: File): boolean {
      if (!this.extensions || this.extensions.length) {
        return true
      }
      for (const ext of this.extensions) {
        if (file.name.endsWith(ext)) {
          return true
        }
      }
      return false
    },
  },
  computed: {
    accept (): string {
      if (!this.extensions) return ''
      return this.extensions.map(e => '.' + e).join(',')
    },
  },
})
</script>

<style lang="sass">
  .dropzone
    padding: 70px
    background: rgba(40, 40, 40, .05)
    border: 2px dashed lightgrey
    border-radius: 10px
    transition: all .3s
    &:hover
      cursor: pointer
    &:hover, &.dragover
      background: rgba(40, 40, 40, .1)
    &.dense
      padding: 20px
    &.disabled
      background: rgba(40, 40, 40, .05)
      color: lightgrey
      border-color: rgba(40, 40, 40, .1)
    &.invalid
      cursor: no-drop
  .hidden
    display: none
</style>

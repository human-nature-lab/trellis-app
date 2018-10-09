<template>
  <sync-sub-step :working="checking"
                 :success-message="$t('done')"
                 :success="success"
                 :current-log="currentLog"
                 :retry="retry">
    {{$t('generating_image_list')}}
  </sync-sub-step>
</template>

<script>
    import FileService from '../../../../services/file/FileService'
    import PhotoService from '../../../../services/photo/PhotoService'
    import SyncSubStep from '../../SyncSubStep.vue'
    import LoggingService, { defaultLoggingService } from '../../../../services/logging/LoggingService'
    export default {
      name: 'generate-image-list',
      data () {
        return {
          success: false,
          checking: false,
          imageList: {},
          currentLog: undefined
        }
      },
      created () {
        this.generateImageList()
      },
      props: {
        loggingService: {
          type: LoggingService,
          required: false,
          'default': function () { return defaultLoggingService }
        }
      },
      methods: {
        generateImageList: function () {
          this.checking = true
          Promise.all([
            PhotoService.getPhotoIdsAndFileNames(),
            FileService.listPhotos()])
            .then((results) => {
              this.checking = false
              const photoList = results[0]
              const localList = results[1]
              for (let i = 0; i < photoList.length; i++) {
                let photo = photoList[i]
                this.imageList[photo.file_name] = photo.id
              }
              for (let j = 0; j < localList.length; j++) {
                let fileName = localList[j].name
                if (this.imageList.hasOwnProperty(fileName)) {
                  delete this.imageList[fileName]
                }
              }
              this.onDone()
            }).catch((err) => {
              this.checking = false
              this.loggingService.log(err).then((result) => { this.currentLog = result })
            })
        },
        onDone: function () {
          this.success = true
          let imagesToDownload = Object.keys(this.imageList)
          this.$emit('generate-image-list-done', imagesToDownload)
        },
        retry: function () {
          this.currentLog = undefined
          this.generateImageList()
        }
      },
      components: {
        SyncSubStep
      }
    }
</script>

<template>
  <div>
    <ul>
      <li>
        Generating list of images to download...
        <strong v-if="success" class="green--text">DONE.</strong>
        <strong v-if="error" class="red--text">ERROR.</strong>
      </li>
    </ul>
    <span v-if="error" class="red--text">
      <p>{{ errorMessage }}</p>
    </span>
    <v-progress-linear
      v-if="checking"
      height="2"
      :indeterminate="true"></v-progress-linear>
    <v-btn
      v-if="!checking && !success"
      color="primary"
      @click.native="retry">Retry</v-btn>
  </div>
</template>

<script>
    import FileService from '@/services/file/FileService'
    import PhotoService from '@/services/photo/PhotoService'
    export default {
      name: 'generate-image-list',
      data () {
        return {
          success: false,
          error: false,
          checking: false,
          errorMessage: '',
          imageList: {}
        }
      },
      created () {
        this.generateImageList()
      },
      props: {
      },
      methods: {
        generateImageList: function () {
          this.checking = true
          Promise.all([
            PhotoService.getPhotos(),
            FileService.listPhotos()])
            .then((results) => {
              this.checking = false
              const photoList = results[0]
              const localList = results[1]
              for (let i = 0; i < photoList.length; i++) {
                let photo = photoList[i]
                this.imageList[photo.fileName] = photo.id
              }
              for (let j = 0; j < localList.length; j++) {
                let fileName = localList[j].name
                if (this.imageList.hasOwnProperty(fileName)) {
                  delete this.imageList[fileName]
                }
              }
              console.log('photoList', photoList)
              console.log('localList', localList)
              this.onDone()
            }).catch((error) => {
              console.log('error', error)
              this.errorMesage = error.message
              this.error = true
            })
        },
        onDone: function () {
          this.success = true
          let imagesToDownload = Object.keys(this.imageList)
          console.log('onDone', imagesToDownload)
          this.$emit('generate-image-list-done', imagesToDownload)
        },
        retry: function () {
          this.error = false
          this.generateImageList()
        }
      },
      computed: {
      },
      components: {
      }
    }
</script>

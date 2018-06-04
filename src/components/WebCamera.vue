<template>
  <div class="camera">
    <div class="viewport">
      <div class="error" v-if="error">{{error}}</div>
      <video ref="video" />
    </div>
    <div class="controls">
      <v-select
        :items="cameras"
        label="Camera"
        item-text="label"/>
    </div>
  </div>
</template>

<script>
  let stream
  export default {
    name: 'web-camera',
    data: () => ({
      error: null,
      cameras: [],
      ctx: null,
      camera_: null,
      isStreaming: false,
      size: {
        width: 600,
        height: 400
      },
      constraints: {
        audio: false,
        video: true
      }
    }),
    mounted: function () {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        this.cameras = devices.filter(d => d.kind === 'videoinput')
        console.log('cameras', this.cameras)
        this.selectCamera(this.cameras[0])
      })
      this.createContext()
    },
    methods: {
      createContext: function () {
        let canvas = document.createElement('canvas')
        this.ctx = canvas.getContext('2d')
      },
      resize: function () {
        this.ctx.canvas.width
      },
      selectCamera: function (camera) {
        this.camera_ = camera
        this.isStreaming = false
        navigator.mediaDevices.getUserMedia(this.constraints).then(s => {
          stream = s
          let video = this.$refs.video
          video.srcObject = stream
          video.onloadedmetadata = () => {
            video.play()
            this.isStreaming = true
          }
          video.error = (err) => {
            console.error(err)
          }
        }).catch(err => {
          this.error = err
        })
      },
      takePhoto: function () {
        this.ctx.drawImage(this.$refs.video, 0, 0, this.size.width, this.size.height)
      }
    },
    beforeDestroy: function () {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop()
        })
      }
      let video = this.$refs.video
      if (video) {
        video.pause()
        video.src = null
        video.srcObject = null
      }
    },
    computed: {
      camera: {
        get: function () {
          return this.camera_
        },
        set: function (camera) {
          this.selectCamera(camera)
        }
      }
    }
  }
</script>

<style scoped>

</style>

<script setup lang="ts">
import { Directory, Filesystem } from '@capacitor/filesystem'
import { FileTransfer } from '@capacitor/file-transfer'
import { Zip } from '@awesome-cordova-plugins/zip'

async function downloadLargeZip () {
  const source = 'https://github.com/human-nature-lab/trellis-app/releases/download/v3.2.0-alpha.120/Trellis.v3.2.0-alpha.120.apk'
  const destination = await Filesystem.getUri({
    directory: Directory.Temporary,
    path: 'large.zip',
  })
  FileTransfer.addListener('progress', evt => {
    console.log('progress', evt)
  })
  try {
    await FileTransfer.downloadFile({
      url: source,
      path: destination.uri,
      progress: true,
    })
    return destination
  } finally {
    FileTransfer.removeAllListeners()
  }
}

async function unzipFile (path: string) {
  const res = await Zip.unzip(path)
}

async function testTransfer () {
  const path = await downloadLargeZip()
  await unzipFile(path)
}
</script>

<template>
  <div>
    <v-btn @click="testTransfer">
      Test Transfer & Zip
    </v-btn>
  </div>
</template>

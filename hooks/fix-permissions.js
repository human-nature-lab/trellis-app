const fs = require('fs')
const path = require('path')

const manifestPath = path.resolve('platforms/android/app/src/main/AndroidManifest.xml')

let manifest = fs.readFileSync(manifestPath, {
  encoding: 'utf-8',
})

// Strips ALL occurrences of <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
// If you have several conflicts (of different maxSDKVersion, or in different formats) then the regex
// may need to be adjusted, or repeated for each format.
manifest = manifest.replace(/^(\s)+<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" \/>$/gm, '')

fs.writeFileSync(manifestPath, manifest)

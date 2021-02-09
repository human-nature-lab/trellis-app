const fs = require('fs')
const path = require('path')
const package = require('./package.json')

const repo = package.repository.url
const argStr = process.argv.join(' ')
const filename = path.basename(__filename)
let tagVersion = argStr.split(filename)[1].trim().split(' ')[0]
tagVersion = tagVersion.replace('refs/heads/', '').replace('refs/tags/', '')
const packageVersion = package.version
console.log('tagVersion', tagVersion, 'packageVersion', packageVersion)

let titleVersion = tagVersion.length ? tagVersion : packageVersion
let releaseVersion = titleVersion.split('-')[0].replace('v', '')
const outputLocation = `changelog/${releaseVersion}.md`

// Create a default changelog
if (!fs.existsSync(outputLocation)) {
  const n = new Date()
  fs.writeFileSync(outputLocation, `

*${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()}*

---

## Major changes
None so far

## Minor changes
None so far

## Bugs
No known bugs fixed at this time

  `.trim())
}

const isPreRelease = tagVersion.includes('-') || !tagVersion.length
const title = `Trellis ${titleVersion}`
console.log(`::set-env name=RELEASE_TITLE::${title}`)
console.log(`::set-env name=RELEASE_FILE::${outputLocation}`)
console.log(`::set-env name=IS_PRERELEASE::${isPreRelease}`)
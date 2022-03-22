const fs = require('fs')
const glob = require('glob')
const path = require('path')
const { loadTranslations } = require('./compile-translations')

const $tReg = /\$t\((.*?)\)/gm
const $tcReg = /\$tc\((.*?)\)/gm

function matches(regex, str) {
  const res = []
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }

    if (m[1]) {
      res.push(m[1])
      // res.push(...matches(regex, m[1]))
    }

    // The result can be accessed through the `m`-variable.
    // m.forEach((match, groupIndex) => {
    //   console.log(`${file}, group ${groupIndex}: ${match}`)
    // })
  }
  return res
}

function replaceAll (str, needle, replacement) {
  let prev = str
  do {
    prev = str
    str = str.replace(needle, replacement)
  } while(prev !== str)
  return str
}

if (require.main === module) {
  const data = loadTranslations()
  const results = {
    missingKeys: [],
    dynamicKeys: [],
  }
  const existingKeys = new Set()
  for (const t of data.translations) {
    existingKeys.add(t[0])
  }
  const root = path.join(__dirname, 'src')
  let files = glob.sync(root + '/**/*.js').concat(glob.sync(root + '/**/*.ts')).concat(glob.sync(root + '/**/*.vue'))
  for (const file of files) {
    const data = fs.readFileSync(file, 'utf-8')
    const $tMatches = matches($tReg, data)
    const $tcMatches = matches($tcReg, data)
    for (const match of $tMatches.concat($tcMatches)) {
      const parts = match.split(',')
      const key = replaceAll(replaceAll(replaceAll(parts[0], '`', ''), "'", ''), '"', '').trim()
      if (key === parts[0]) {
        results.dynamicKeys.push({ key, file, })
      } else if (!existingKeys.has(key)) {
        results.missingKeys.push({ key, file })
      }
    }
  }
  console.log(JSON.stringify(results, null, 2))
}
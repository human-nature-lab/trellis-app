const Papa = require('papaparse')
const fs = require('fs')
const path = require('path')
const glob = require('glob')

const root = path.join(__dirname, './src/i18n')
const source = fs.readFileSync(path.join(root, 'translations.csv'), 'utf8')
const translations = Papa.parse(source, {
  delimiter: ',',
  newline: '\n',
  skipEmptyLines: true,
  fastMode: false,
}).data

const existing = fs.readdirSync(root).filter(fn => fn.endsWith('.json'));
for (const p of existing) {
  const f = path.join(root, p)
  console.log('removing', f)
  fs.unlinkSync(f)
}

// Trim empty space from each item
for (const row of translations) {
  for (let i = 0; i < row.length; i++) {
    row[i] = row[i].trim()
    if (row[i].startsWith('\"')) {
      row[i] = row[i].substr(1)
    }
  }
}

let locales = translations.shift().filter(t => t !== 'key' && t !== 'comment')
console.log('compiling locales', locales)


// Transform the translations into this format
/**
 * {
 *    en: {
 *      title: 'Trellis'
 *    },
 *    es: {
 *      title: 'Trellis'
 *    }
 * }
 */
const errors = locales.reduce((agg, l) => {
  agg[l] = {}
  return agg
}, {})
let messages = locales.reduce((agg, l) => {
  agg[l] = {}

  return agg
}, {})
messages = translations.reduce((coll, t) => {
  for (let i = 0; i < locales.length; i++) {
    if (t[i + 1]) {
      const l = locales[i]
      const key = t[0]
      const msg = t[i + 1]
      coll[l][key] = msg
      
      // Simple length check to identify errors
      if (msg.length < 2) {
        errors[l][key] = msg
      }
    }
  }
  return coll
}, messages)


// Write the files
for (const l of locales) {
  let data = messages[l]
  let errs = errors[l]
  fs.writeFileSync(path.join(root, `${l}.json`), JSON.stringify(data, null, 2), 'utf8')
  
  // Write any discovered errors
  if (Object.keys(errs).length) {
    fs.writeFileSync(path.join(root, `${l}-errors.json`), JSON.stringify(errs, null, 2), 'utf8')
  }
}
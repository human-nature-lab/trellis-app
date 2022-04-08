const Papa = require('papaparse')
const fs = require('fs')
const path = require('path')
const glob = require('glob')

const root = path.join(__dirname, './src/i18n')
const source = fs.readFileSync(path.join(root, 'translations.csv'), 'utf8')

function loadTranslations () {
  const translations = Papa.parse(source, {
    delimiter: ',',
    newline: '\n',
    skipEmptyLines: true,
    fastMode: false,
  }).data

  
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
  return {
    translations,
    locales,
  }
}

function cleanExisting () {
  const existing = fs.readdirSync(root).filter(fn => fn.endsWith('.json'));
  for (const p of existing) {
    const f = path.join(root, p)
    console.log('removing', f)
    fs.unlinkSync(f)
  }
}

function transform ({ translations, locales }) {
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
  const errors = {
    size: [],
    duplicates: [],
  }
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
        
        // Simple length check to identify errors
        if (msg.length < 2) {
          errors.size.push({ locale: l,  key, msg, line: i })
        }
        if (key in coll[l]) {
          const dup = coll[l][key]
          errors.duplicates.push({ locale: l, key, msg, dup, line: i })
        }
        
        coll[l][key] = msg
      }
    }
    return coll
  }, messages)
  
  
  // Write the files
  for (const l of locales) {
    let data = messages[l]
    let f = path.join(root, `${l}.json`)
    console.log('writing file', f)
    fs.writeFileSync(f, JSON.stringify(data, null, 2), 'utf8')
  }
  
  // Write any discovered errors
  if (errors.duplicates.length || errors.general.length) {
    f = path.join(root, 'errors.json')
    console.log('writing errors', f)
    fs.writeFileSync(f, JSON.stringify(errors, null, 2), 'utf8')
  }
}


if (require.main === module) {
  cleanExisting()
  const data = loadTranslations()
  transform(data)
}

module.exports = {
  loadTranslations,
}
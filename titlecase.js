const Papa = require('papaparse')
const fs = require('fs')

const file = 'C:\\Users\\wi27\\Documents\\Trellis\\trellis-server\\trellis-api\\resources\\demo\\respondents.csv'
const data = fs.readFileSync(file, 'utf8')
Papa.parse(data, {
  header: true,
  complete (results) {
    const records = results.data.filter(r => !!r.name)
    for (const record of records) {
      record.name = record.name.split(' ').map(n => n.substr(0, 1).toUpperCase() + n.substr(1)).join(' ')
    }
    const csv = Papa.unparse(records)
    fs.writeFileSync(file, csv)
  }
})

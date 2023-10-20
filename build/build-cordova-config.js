const path = require('path')
const fs = require('fs')
const handlebars = require('handlebars')

const isProd = process.env.NODE_ENV === 'production'
const data = require(isProd ? '../config/config-xml.prod' : '../config/config-xml.dev')
console.log('data', data)
const entry = path.join(__dirname, '../src/config.xml.hbs')
const output = path.join(__dirname, '../www/config.xml')

const template = handlebars.compile(fs.readFileSync(entry, 'utf8'))

fs.writeFileSync(output, template(data), 'utf8')

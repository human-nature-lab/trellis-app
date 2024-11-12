const path = require('path')
const fs = require('fs')
const mkdirp = require('mkdirp')
const handlebars = require('handlebars')

const isProd = process.env.NODE_ENV === 'production'
const data = require(isProd ? '../config/config-xml.prod' : '../config/config-xml.dev')
console.log('data', data)
const entry = path.join(__dirname, '../src/config.xml.hbs')
const output = path.join(__dirname, '../www/config.xml')

data.ALLOW_CLEARTEXT_TRAFFIC = data.DEV || !!process.env.ALLOW_CLEARTEXT_TRAFFIC
const template = handlebars.compile(fs.readFileSync(entry, 'utf8'))

mkdirp.sync(path.dirname(output))
fs.writeFileSync(output, template(data), 'utf8')

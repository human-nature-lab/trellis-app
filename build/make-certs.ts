// npx mkcert create-ca && npx mkcert create-cert && mv ./ca.crt ./res/raw/dev_ca.crt && rm -f ./ca.key
import { createCA, createCert } from 'mkcert'
import * as devData from '../config/config-xml.dev'
import { promises as fs } from 'fs'

async function run () {
  const caOpts = {
    organization: 'Trellis',
    countryCode: 'US',
    state: 'Connecticut',
    locality: 'New Haven',
    validity: 365,
  }
  console.log('Creating CA', caOpts)
  const ca = await createCA(caOpts)

  const apiOrigin = new URL(devData.API_ORIGIN)

  const certOpts = {
    ca,
    domains: ['localhost', apiOrigin.hostname],
    validity: 365,
  }
  console.log('Creating cert', certOpts)
  const cert = await createCert(certOpts)

  await fs.writeFile('dev_ca.crt', ca.cert, 'utf8')
  await fs.writeFile('dev_cert.crt', cert.cert, 'utf8')
  await fs.writeFile('dev_cert.key', cert.key, 'utf8')

  await fs.rename('dev_ca.crt', 'res/raw/dev_ca.crt')
  await fs.copyFile('dev_cert.crt', '../docker/nginx/ssl/cert.crt')
  await fs.copyFile('dev_cert.key', '../docker/nginx/ssl/cert.key')

  console.log('Done!')
}

run().catch(console.error)

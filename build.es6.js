#!/usr/bin/env node
'use strict'
import parseArgs from 'minimist'
import { spawn } from 'child_process'
import fs from 'fs'
import mv from 'mv'
import path from 'path'
import pkg from './package.json'
import {prompt} from 'promptly'
import {sentryRelease} from './build/utils'

const argv = parseArgs(process.argv)

const release = !!argv['release'] || !!argv['r']

const opts = {
  apkPath: argv['apk-path'] ? argv['apk-path'] : (release ? 'platforms/android/app/build/outputs/apk/release/' : 'platforms/android/app/build/outputs/apk/debug/'),
  apkOutPath: argv['apk-out-path'] ? argv['apk-out-path'] : (release ? 'releases' : 'dev-releases/'),
  configPath: argv['config'],
  apkName: argv['apk-name'] ? argv['apk-name'] : (release ? 'app-release.apk' : 'app-debug.apk'),
  outName: argv['out-name'] ? argv['out-name'] : 'Trellis',
  apk: !!argv['apk'],
  web: !!argv['web'],
  release,
  skipBuild: !!argv['skip-build'],
  skipSentry: !!argv['skip-sentry'],
  sentryProject: argv['sentry-project'] ? argv['sentry-project'] : 'trellis',
  sentryToken: argv['sentry-token'],
  sentryOrg: argv['sentry-org'] ? argv['sentry-org'] : 'human-nature-lab',
  keystorePath: argv['keystore-path'] ? argv['keystore-path'] : 'trellis-keystore.jks',
  keyAlias: argv['key-alias'] ? argv['key-alias'] : (release ? 'trellis-web' : 'trellis-web-dev')
}

const buildConfigPath = 'src/config.js'
const version = pkg.version

// if (!opts.configPath) throw Error('Need to have the config argument supplied')

// console.log(argv, opts)

async function exec (cmd, opts, envOpts) {
  if (['npm', 'sentry-cli', 'cordova'].indexOf(cmd) > -1) {
    cmd = /^win/.test(process.platform) ? cmd + '.cmd' : cmd
  }
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, opts, envOpts)
    p.stdout.on('data', data => {
      console.log(`\r${cmd}: ${data.toString()}`)
    })
    p.stderr.on('data', data => {
      console.error(`${cmd}: ${data.toString()}`)
    })
    p.on('error', err => {
      console.error(err)
      reject(err)
    })
    p.on('exit', code => {
      if (code === 1) {
        reject(code)
      } else {
        resolve()
      }
    })
  })
}

async function moveApk () {
  await new Promise((resolve, reject) => {
    const inF = path.join(opts.apkPath, opts.apkName)
    const out = path.join(opts.apkOutPath, `${opts.outName}-${version}.apk`)
    console.log('moving apk from', inF, 'to', out)
    mv(inF, out, err => {
      if (err) reject(err)
      else resolve()
    })
  })
}

function getEnv () {
  if (!opts.sentryToken || !opts.sentryOrg || !opts.sentryProject) throw new Error('sentryToken, sentryOrg, and sentryProject are all required to create a sentry release')
  return Object.assign({
    SENTRY_AUTH_TOKEN: opts.sentryToken,
    SENTRY_ORG: opts.sentryOrg,
    SENTRY_PROJECT: opts.sentryProject
  }, process.env)
}

async function buildApk () {
  console.log('building APK')
  const env = getEnv()
  await exec('npm', ['run', 'android'], {
    env
  })
}

async function buildWeb () {
  // Build files
  console.log('bundling files for web')
  const env = getEnv()
  await exec('npm', ['run', 'build'], {
    env
  })
  console.log('zipping files')
  // await exec('zip www.zip www/')
  // TODO: Push to server
}

async function buildRelease (keystorePassword, keyPassword) {
  console.log('building release APK')
  const env = getEnv()
  try {
    await exec('cordova', [
      'build', 'android', '--release', '--', '--storePassword', keystorePassword, '--password', keyPassword, '--keystore', opts.keystorePath, '--alias', opts.keyAlias
    ], {
      env
    })
  } catch (err) {
    console.error(err)
  }
}

/**
 * Based on the documentation here https://docs.sentry.io/workflow/releases/?platform=browser#associate-commits-with-a-release.
 * @returns {Promise<void>}
 */
async function createSentryRelease () {
  const version = sentryRelease()
  console.log('version', version)
  const env = getEnv()
  await exec('sentry-cli', ['releases', '--org', opts.sentryOrg, 'new', '-p', opts.sentryProject, '--log-level=debug', version], {
    env
  })
  await exec('sentry-cli', ['releases', 'set-commits', '--auto', '--log-level=debug', version], {
    env
  })
}

async function swapFiles (fileOne, fileTwo) {
  console.log('swapping', fileOne, 'and', fileTwo)
  const tmpName = fileOne + '.tmp'
  fs.renameSync(fileOne, tmpName)
  fs.renameSync(fileTwo, fileOne)
  fs.renameSync(tmpName, fileTwo)
}

async function cleanUpConfig () {
  await swapFiles(buildConfigPath, opts.configPath)
}

async function earlyExit () {
  // await cleanUpConfig()
  process.exit()
}

async function getPasswords () {
  try {
    const keystorePassword = await prompt('Keystore password: ', {silent: true})
    const keyPassword = await prompt('Key password: ', {silent: true})
    return [keystorePassword, keyPassword]
  } catch (err) {
    earlyExit()
  }
}

process.onunhandledrejection = function (err) {
  console.error(err)
  earlyExit()
}

process.on('SIGINT', function () {
  earlyExit()
})

async function main () {
  // await swapFiles(buildConfigPath, opts.configPath)
  if (opts.apk) {
    if (opts.release) {
      const [keystorePassword, keyPassword] = await getPasswords()
      await buildWeb()
      await buildRelease(keystorePassword, keyPassword)
      await moveApk()
    } else if (!opts.skipBuild) {
      await buildApk()
      await moveApk()
    }
    if (!opts.skipSentry) {
      await createSentryRelease()
    }
  }
  if (opts.web) {
    if (!opts.skipBuild) {
      await buildWeb()
    }
    if (!opts.skipSentry) {
      await createSentryRelease()
    }
  }
  // await cleanUpConfig()
}

main()

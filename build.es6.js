#!/usr/bin/env node
'use strict'
import parseArgs from 'minimist'
import { spawn } from 'child_process'
import fs from 'fs'
import mv from 'mv'
import path from 'path'
import pkg from './package.json'
import {sentryRelease} from './build/utils'

const argv = parseArgs(process.argv)

const opts = {
  apkPath: argv['apk-path'] ? argv['apk-path'] : 'platforms/android/app/build/outputs/apk/debug/',
  apkOutPath: argv['apk-out-path'] ? argv['apk-out-path'] : 'releases/',
  configPath: argv['config'],
  apkName: argv['apk-name'] ? argv['apk-name'] : 'app-debug.apk',
  outName: argv['out-name'] ? argv['out-name'] : 'Trellis',
  apk: !!argv['apk'],
  web: !!argv['web'],
  skipBuild: !!argv['skip-build'],
  skipSentry: !!argv['skip-sentry'],
  sentryProject: argv['sentry-project'] ? argv['sentry-project'] : 'trellis',
  sentryToken: argv['sentry-token'],
  sentryOrg: argv['sentry-org']
}

const buildConfigPath = 'src/config.js'
const version = pkg.version

if (!opts.configPath) throw Error('Need to have the config argument supplied')

console.log(argv, opts)

async function exec (cmd, opts, envOpts) {
  if (cmd === 'npm' || cmd === 'sentry-cli') {
    cmd = /^win/.test(process.platform) ? cmd + '.cmd' : cmd
  }
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, opts, envOpts)
    p.stdout.on('data', data => {
      console.log(`${cmd}: ${data.toString()}`)
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

/**
 * Based on the documentation here https://docs.sentry.io/workflow/releases/?platform=browser#associate-commits-with-a-release.
 * @returns {Promise<void>}
 */
async function createSentryRelease () {
  const config = require('./' + buildConfigPath).default
  console.log('config', config)
  const version = sentryRelease(config)
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
  await cleanUpConfig()
  process.exit()
}

process.onunhandledrejection = function (err) {
  console.error(err)
  earlyExit()
}

process.on('SIGINT', function () {
  earlyExit()
})

async function main () {
  await swapFiles(buildConfigPath, opts.configPath)
  if (opts.apk) {
    if (!opts.skipBuild) {
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
  await cleanUpConfig()
}

main()

import config, {ENV_TYPE} from '@/config'

// Where the services for these environment types are located
const ENV_DIRS = {}
ENV_DIRS[ENV_TYPE.CORDOVA] = 'cordova'
ENV_DIRS[ENV_TYPE.WEB] = 'web'
ENV_DIRS[ENV_TYPE.TEST] = 'test'

// The order that arguments should be passed in for selectByEnv
const SELECT_ENV_ORDER = [ENV_TYPE.CORDOVA, ENV_TYPE.WEB, ENV_TYPE.TEST]

export function selectByEnv (...items) {
  let currentEnvIndex = SELECT_ENV_ORDER.find(envType => envType === config.environment)
  return items[currentEnvIndex]
}

// TODO: Does this need caching to use the same instance as other require statements?
export function requireByEnv (name) {
  let config = require('@/config').default
  let envName = ENV_DIRS[config.environment]
  console.log(`Importing ${name}.${envName} based on config`)
  try {
    return require(`@/services/${envName}/${name}.${envName}`).default
  } catch (err) {
    console.error(`Unable to import your service for this environment. Either your service for this environment does not exist yet or the name, ${name} doesn't match the pattern ${name}.${envName}.js`)
    return null
  }
}

/**
 * Wait to import the class until it's actually used. This might not work...
 * @param name
 * @returns {*}
 */
export function asGetter (name) {
  let o = {
    get serviceGetter () {
      return requireByEnv(name)
    }
  }
  return o.serviceGetter
}

// Environment dependent services
export const FormService = requireByEnv('FormService')
export const RespondentService = requireByEnv('RespondentService')
export const SurveyService = requireByEnv('SurveyService')
export const DataService = requireByEnv('DataService')

// Shared services
export const TranslationService = require('@/services/TranslationService')
export const InterpolationService = require('@/services/InterpolationService')

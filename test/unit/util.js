import config, {ENV_TYPE} from '@/config'

export default function describeInEachEnv (name, callback) {
  for (let type of Object.keys(ENV_TYPE)) {
    describe(name, () => {
      before(() => {
        config.environment = ENV_TYPE[type]
      })
      callback(type)
    })
  }
}

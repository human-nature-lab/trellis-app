import ServerConfigGuard from './ServerConfigGuard'

export default {
  name: 'AlreadyConfiguredServerGuard',
  async condition () {
    return !(await ServerConfigGuard.condition())
  }
}

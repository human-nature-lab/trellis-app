import User from '../../entities/trellis/User'
import UserService from '../../services/user/UserService'
import { routeQueue } from '../index'

export default {
  name: 'AlreadyLoggedInGuard',
  async condition () {
    const user = await UserService.getCurrentUser()
    // redirect to next if already logged in
    return !(user instanceof User)
  },
  redirect () {
    return routeQueue.nextOrDefault()
  }
}

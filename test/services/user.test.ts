import './globals'
import {expect} from 'chai'

import User from '../../src/entities/trellis/User'
import { UserServiceCordova } from '../../src/services/user/UserServiceCordova'
import { UserServiceWeb } from '../../src/services/user/UserServiceWeb'

export default function () {
  let userCordova = new UserServiceCordova()
  let userWeb = new UserServiceWeb()

  describe('User service', () => {

    async function assertSameCurrentUser () {
      let cUser = await userCordova.getCurrentUser()
      let wUser = await userWeb.getCurrentUser()

      expect(cUser).to.be.instanceOf(User, 'cordova user should be an instance of User')
      expect(wUser).to.be.instanceOf(User, 'web user should be an instance of User')

      expect(cUser).to.deep.equal(wUser, 'The returned users are not the same')
    }

    it('should return identical user objects', async () => await assertSameCurrentUser)
    it('should set user object', async () => {
      const u = new User()
      u.id = 'wow'
      u.name = 'tester'
      u.password = 'ok'
      u.role = 'admin'
      userCordova.setCurrentUser(u)
      userWeb.setCurrentUser(u)

      await (async () => assertSameCurrentUser())
    })
  })
}



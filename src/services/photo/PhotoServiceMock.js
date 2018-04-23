import MockService from '../mock/MockService'

const photoProviderUrl = 'https://source.unsplash.com/random'

export default class PhotoServiceMock {
  static getPhotoUrl (photoId) {
    return MockService.randomlyFail(resolve => {
      return photoProviderUrl + '/400x300'
    })
  }
}

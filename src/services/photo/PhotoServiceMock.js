import MockService from '../mock/MockService'

const photoProviderUrl = 'https://source.unsplash.com/random'

export default class PhotoServiceMock {
  static getPhotoSrc (photoId) {
    return MockService.randomlyFail(resolve => {
      return photoProviderUrl + '/400x300'
    }, 500, 0.1)
  }
}

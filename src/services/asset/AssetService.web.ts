import Asset from '@/entities/trellis/Asset'
import { AssetServiceInterface } from './AssetServiceInterface'
import http from '@/services/http/AxiosInstance'

export class AssetService implements AssetServiceInterface {
  async getAsset (id: string) {
    const res = await http().get(`/asset/${id}`, {
      responseType: 'blob',
    })
    return res.data as Blob
  }

  async listAssets () {
    const res = await http().get('/assets')
    return res.data.assets.map(a => new Asset().fromSnakeJSON(a))
  }

  async createAsset (asset: Pick<Asset, 'fileName' | 'shouldSync'>, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', asset.fileName)
    formData.append('shouldSync', asset.shouldSync.toString())
    const res = await http().post('/asset', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return new Asset().fromSnakeJSON(res.data.asset)
  }

  async updateAsset (asset: Pick<Asset, 'id' | 'fileName' | 'shouldSync'>, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', asset.fileName)
    formData.append('shouldSync', asset.shouldSync.toString())
    const res = await http().put(`/asset/${asset.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return new Asset().fromSnakeJSON(res.data.asset)
  }

  async deleteAsset (id: string) {
    await http().delete(`/asset/${id}`)
  }
}

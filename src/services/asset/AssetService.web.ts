import Asset from '@/entities/trellis/Asset'
import { AssetServiceInterface, CreateAsset, UpdateAsset } from './AssetServiceInterface'
import http from '@/services/http/AxiosInstance'

export class AssetService implements AssetServiceInterface {
  async getAssets (...ids: string[]) {
    const res = await http().get('/assets', {
      params: {
        ids,
      },
    })
    return res.data.assets.map((asset: any) => new Asset().fromSnakeJSON(asset))
  }

  async getAssetUrl (id: string) {
    const res = await http().get(`/asset/${id}`, {
      responseType: 'blob',
    })
    return URL.createObjectURL(res.data as Blob)
  }

  async createAsset (asset: CreateAsset, file: File | Blob) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', asset.fileName)
    formData.append('isFromSurvey', asset.isFromSurvey ? 'true' : 'false')
    const res = await http().post('/asset', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return new Asset().fromSnakeJSON(res.data.asset)
  }

  async updateAsset (asset: UpdateAsset, file: File | Blob) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', asset.fileName)
    formData.append('isFromSurvey', asset.isFromSurvey ? 'true' : 'false')
    const res = await http().put(`/asset/${asset.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return new Asset().fromSnakeJSON(res.data.asset)
  }

  async deleteAssets (...ids: string[]) {
    await http().delete('/assets', {
      params: {
        ids,
      },
    })
  }
}

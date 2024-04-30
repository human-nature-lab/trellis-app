import { FSFileEntry } from '@/cordova/file'
import Asset from '@/entities/trellis/Asset'

export type CreateAsset = Pick<Asset, 'fileName' | 'shouldSync'> & Partial<Pick<Asset, 'type' | 'mimeType'>>
export type UpdateAsset = CreateAsset & Pick<Asset, 'id'>
export interface AssetServiceInterface {
  // downloadAsset(id: string): PromiseLike<Blob>
  getAssetUrl(id: string): PromiseLike<string>
  getAssets(...ids: string[]): PromiseLike<Asset[]>
  createAsset(asset: CreateAsset, file: FSFileEntry | Blob): PromiseLike<Asset>
  updateAsset(asset: UpdateAsset, file: FSFileEntry | Blob): PromiseLike<Asset>
  deleteAssets(...ids: string[]): PromiseLike<void>
}

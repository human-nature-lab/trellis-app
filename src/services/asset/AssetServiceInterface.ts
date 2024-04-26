import Asset from '@/entities/trellis/Asset'

export interface AssetServiceInterface {
  // downloadAsset(id: string): PromiseLike<Blob>
  getAssetUrl(id: string): PromiseLike<string>
  getAssets(...ids: string[]): PromiseLike<Asset[]>
  createAsset(asset: Pick<Asset, 'fileName' | 'shouldSync'>, file: File | Blob): PromiseLike<Asset>
  updateAsset(asset: Pick<Asset, 'id' | 'fileName' | 'shouldSync'>, file: File | Blob): PromiseLike<Asset>
  deleteAssets(...ids: string[]): PromiseLike<void>
}

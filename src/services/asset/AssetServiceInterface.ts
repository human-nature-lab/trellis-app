import Asset from '@/entities/trellis/Asset'

export interface AssetServiceInterface {
  getAsset(id: string): PromiseLike<Blob>
  listAssets(): PromiseLike<Asset[]>
  createAsset(asset: Pick<Asset, 'fileName' | 'shouldSync'>, file: File): PromiseLike<Asset>
  updateAsset(asset: Pick<Asset, 'id' | 'fileName' | 'shouldSync'>, file: File): PromiseLike<Asset>
  deleteAsset(id: string): PromiseLike<void>
}

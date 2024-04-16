import { In, IsNull } from 'typeorm'
import uuidv4 from 'uuid/v4'
import Asset from '@/entities/trellis/Asset'
import { AssetServiceInterface } from './AssetServiceInterface'
import DatabaseService from '../database'
import { getTypeFromMime } from '@/lib/mime'
import { file } from '@/cordova/file'
import path from 'path'

export class AssetService implements AssetServiceInterface {
  async getAssets (...ids: string[]) {
    const repo = await DatabaseService.getRepository(Asset)
    if (ids.length === 0) {
      return repo.find({
        where: {
          deletedAt: IsNull(),
        },
      })
    }
    return repo.find({
      where: {
        id: In(ids),
        deletedAt: IsNull(),
      },
    })
  }

  async getAssetUrl (id: string) {
    const repo = await DatabaseService.getRepository(Asset)
    const asset = await repo.findOne(id)
    if (!asset) {
      throw new Error('Asset not found')
    }
    const fs = await file.persistent()
    const f = await fs.root.getFile(path.join('assets', asset.id))
    return f.getDataURL()
  }

  async createAsset (asset: Pick<Asset, 'fileName' | 'shouldSync'>, f: File) {
    const repo = await DatabaseService.getRepository(Asset)
    const newAsset = new Asset()
    newAsset.id = uuidv4()
    newAsset.fileName = asset.fileName
    newAsset.shouldSync = asset.shouldSync
    newAsset.mimeType = f.type
    newAsset.type = getTypeFromMime(f.type)
    newAsset.size = f.size
    const fs = await file.persistent()
    await fs.root.writeFile(path.join('assets', newAsset.id), f)
    return repo.save(newAsset)
  }

  async updateAsset (data: Pick<Asset, 'id' | 'fileName' | 'shouldSync'>, f: File) {
    const repo = await DatabaseService.getRepository(Asset)
    const asset = await repo.findOne(data.id)
    if (!asset) {
      throw new Error('Asset not found')
    }
    asset.fileName = data.fileName
    asset.shouldSync = data.shouldSync
    asset.mimeType = f.type
    asset.type = getTypeFromMime(f.type)
    asset.size = f.size
    asset.deletedAt = null
    const fs = await file.persistent()
    await fs.root.writeFile(path.join('assets', asset.id), f)
    return repo.save(asset)
  }

  async deleteAssets (...ids: string[]) {
    const repo = await DatabaseService.getRepository(Asset)
    await repo.delete(ids)
  }
}

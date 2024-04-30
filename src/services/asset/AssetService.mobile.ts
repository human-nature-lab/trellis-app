import { In, IsNull } from 'typeorm'
import uuidv4 from 'uuid/v4'
import Asset from '@/entities/trellis/Asset'
import { AssetServiceInterface, CreateAsset, UpdateAsset } from './AssetServiceInterface'
import DatabaseService from '../database'
import { getTypeFromMime } from '@/lib/mime'
import { FSFileEntry, file } from '@/cordova/file'

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
    const assetDir = await file.dataDirectory('assets', { create: true })
    const f = await assetDir.getFile(asset.id)
    return f.getDataURL()
  }

  async createAsset (asset: CreateAsset, f: FSFileEntry | Blob) {
    const repo = await DatabaseService.getRepository(Asset)
    const newAsset = new Asset()
    newAsset.id = uuidv4()
    newAsset.fileName = asset.fileName
    newAsset.shouldSync = asset.shouldSync
    if (f instanceof FSFileEntry) {
      const meta = await f.getMetadata()
      newAsset.size = meta.size
      newAsset.mimeType = asset.mimeType || (await f.type())
    } else {
      newAsset.size = f.size
      newAsset.mimeType = asset.mimeType || f.type
    }
    newAsset.type = asset.type || getTypeFromMime(newAsset.mimeType)
    const assetDir = await file.dataDirectory('assets', { create: true })
    if (f instanceof FSFileEntry) {
      await f.moveTo(assetDir, newAsset.id)
    } else {
      await assetDir.writeFile(newAsset.id, f)
    }
    return repo.save(newAsset)
  }

  async updateAsset (data: UpdateAsset, f: File | Blob) {
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
    const assetDir = await file.dataDirectory('assets', { create: true })
    await assetDir.writeFile(asset.id, f)
    return repo.save(asset)
  }

  async deleteAssets (...ids: string[]) {
    const repo = await DatabaseService.getRepository(Asset)
    await repo.delete(ids)
  }
}

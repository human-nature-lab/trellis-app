import { In, IsNull } from 'typeorm'
import uuidv4 from 'uuid/v4'
import Asset from '@/entities/trellis/Asset'
import { AssetServiceInterface, CreateAsset, UpdateAsset } from './AssetServiceInterface'
import DatabaseService from '../database'
import { getTypeFromMime } from '@/lib/mime'
import { FSFileEntry, file } from '@/cordova/file'
import HashService from '../hash'

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
    newAsset.isFromSurvey = !!asset.isFromSurvey
    if (f instanceof FSFileEntry) {
      const meta = await f.getMetadata()
      newAsset.size = meta.size
      newAsset.mimeType = asset.mimeType || (await f.type())
      newAsset.md5Hash = await HashService.md5Entry(f)
    } else {
      newAsset.size = f.size
      newAsset.mimeType = asset.mimeType || f.type
      newAsset.md5Hash = await HashService.md5Blob(f)
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

  async updateAsset (data: UpdateAsset, f: FSFileEntry | Blob) {
    const repo = await DatabaseService.getRepository(Asset)
    const asset = await repo.findOne(data.id)
    if (!asset) {
      throw new Error('Asset not found')
    }
    asset.fileName = data.fileName
    if (f instanceof FSFileEntry) {
      const meta = await f.getMetadata()
      asset.size = meta.size
      asset.mimeType = data.mimeType || (await f.type())
      asset.md5Hash = await HashService.md5Entry(f)
    } else {
      asset.size = f.size
      asset.mimeType = data.mimeType || f.type
      asset.md5Hash = await HashService.md5Blob(f)
    }
    asset.isFromSurvey = !!data.isFromSurvey
    asset.type = getTypeFromMime(asset.mimeType)
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

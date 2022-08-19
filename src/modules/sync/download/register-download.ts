import SyncService from '@/services/SyncService'
import Sync from '@/entities/trellis-config/Sync'

export async function registerDownload (data: { sync: Sync }) {
  await SyncService.registerSuccessfulSync(data.sync)
}

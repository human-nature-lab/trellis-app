export const APP_ENV = {
  CORDOVA: 1, // Sync, local sqlite storage
  WEB: 2 // No sync, REST
}

export const APP_MODE = {
  TEST: 1, // Sync, local sqlite storage
  PROD: 2
}

export const COMPARE_SNAPSHOTS_RESULTS = {
  NONE: 0, // Not run yet
  NO_DOWNLOAD: 1, // No local snapshot found, don't check last upload, auto-start download
  DOWNLOAD_OLDER: 2, // Local snapshot older than server snapshot, no local upload or local upload older than server snapshot, auto-start download
  DOWNLOAD_SAME_UPLOAD_OLDER: 3, // Local snapshot same as server snapshot, no local upload or local upload older than server snapshot, stop and notify
  DOWNLOAD_OLDER_UPLOAD_NEWER: 4, // Local snapshot older than server snapshot, local upload newer than server snapshot, stop and warn
  DOWNLOAD_SAME_UPLOAD_NEWER: 5, // Local snapshot same as server snapshot, local upload newer than server snapshot, stop and warn
  DOWNLOAD_NEWER: 6 // Local snapshot newer than server snapshot, don't check last upload, stop and warn
}

export const BUTTON_STATUS = {
  DISABLED: 0,
  ENABLED: 1,
  WARNING: 2,
  AUTO_CONTINUE: 2
}

export default {
  APP_ENV,
  APP_MODE
}

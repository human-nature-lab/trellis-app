export const APP_ENV = {
  CORDOVA: 1, // Sync, local sqlite storage
  WEB: 2 // No sync, REST
}

export const APP_MODE = {
  TEST: 1, // Sync, local sqlite storage
  PROD: 2
}

export default {
  APP_ENV,
  APP_MODE
}

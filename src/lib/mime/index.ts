const audioMimeTypes = [
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/aac',
  'audio/webm',
]

const imageMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
]

const videoMimeTypes = [
  'video/mp4',
  'video/ogg',
  'video/webm',
  'video/flv',
  'video/x-flv',
]

const textMimeTypes = [
  'text/plain',
  'text/csv',
  'text/html',
  'text/css',
  'text/javascript',
  'text/markdown',
  'text/xml',
  'text/json',
]

const documentTypes = [
  'application/msword',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
]

const binaryTypes = [
  'application/octet-stream',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-tar',
  'application/x-7z-compressed',
  'application/x-bzip',
  'application/x-bzip2',
  'application/x-gzip',
  'application/x-xz',
  'application/x-rar',
  'application/x-tar',
  'application/x-7z-compressed',
  'application/x-bzip',
  'application/x-bzip2',
  'application/x-gzip',
  'application/x-xz',
  'application/x-rar',
]

export const typeMap = {
  audio: audioMimeTypes,
  image: imageMimeTypes,
  video: videoMimeTypes,
  text: textMimeTypes,
  document: documentTypes,
  binary: binaryTypes,
}

export function getTypeFromMime (mimeType: string): string {
  for (const type in typeMap) {
    if (typeMap[type].includes(mimeType)) {
      return type
    }
  }
  return 'unknown'
}

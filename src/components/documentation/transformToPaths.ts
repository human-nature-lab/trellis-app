import path from 'path'
type FileStruct = {[key: string]: string|FileStruct}
export default function transformToPaths (target, suffix?: string): typeof target {
  function toPaths (fileStruct: FileStruct, basePath: string, suffix: string): typeof target {
    let fullFileStruct = {}
    for (let key in fileStruct) {
      let fileOrDirStruct = fileStruct[key]
      fullFileStruct[key] = typeof fileOrDirStruct === 'object' ? toPaths(fileOrDirStruct, path.join(basePath, key.replace(/_/g, '-')), suffix) : path.join(basePath, fileOrDirStruct + suffix)
    }
    return fullFileStruct
  }
  return toPaths(target, '', suffix)
}

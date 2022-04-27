import { replaceAll } from '../../classes/replaceAll'
type FileStruct = {[key: string]: string|FileStruct}

function join (a: string, b: string) {
  return replaceAll(a + '/' + b, '//', '/')
}
export default function transformToPaths (target, suffix?: string): typeof target {
  function toPaths (fileStruct: FileStruct, basePath: string, suffix: string): typeof target {
    const fullFileStruct = {}
    for (const key in fileStruct) {
      const fileOrDirStruct = fileStruct[key]
      fullFileStruct[key] = typeof fileOrDirStruct === 'object'
        ? toPaths(fileOrDirStruct, join(basePath, key.replace(/_/g, '-')), suffix)
        : join(basePath, fileOrDirStruct + suffix)
    }
    return fullFileStruct
  }
  return toPaths(target, '', suffix)
}

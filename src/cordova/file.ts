import path from 'path'

interface CordovaFile {
  name: string
  localURL: string
  type: string
  lastModified: number
  lastModifiedDate: number
  size: number
  start: number
  end: number
  slice (start: number, end: number): CordovaFile
}

const FileErrorCodes = {
  1: 'NOT_FOUND_ERR',
  2: 'SECURITY_ERR',
  3: 'ABORT_ERR',
  4: 'NOT_READABLE_ERR',
  5: 'ENCODING_ERR',
  6: 'NO_MODIFICATION_ALLOWED_ERR',
  7: 'INVALID_STATE_ERR',
  8: 'SYNTAX_ERR',
  9: 'INVALID_MODIFICATION_ERR',
  10: 'QUOTA_EXCEEDED_ERR',
  11: 'TYPE_MISMATCH_ERR',
  12: 'PATH_EXISTS_ERR',
}

// Make file errors more readable
function rejectFileError (cb: (err: Error) => void): (err: Error | FileError) => void {
  return err => {
    const code = err && err.code
    if (err.code) {
      const msg = FileErrorCodes[code] || 'Unknown FileError'
      const res = new Error(`FileError: ${msg} (${code})`)
      res.code = code
      cb(res)
    } else {
      cb(err)
    }
  }
}

interface SimplestEntry {
  fullPath: FileEntry['fullPath']
  isDirectory: FileEntry['isDirectory']
  isFile: FileEntry['isFile']
  name: FileEntry['name']
  getParent (success: (entry: Entry) => void, failure: (err: Error | FileError) => void): void
  toURL: FileEntry['toURL']
  toInternalURL: FileEntry['toInternalURL']
  nativeURL: FileEntry['nativeURL']
}

export type FSEntry = FSFileEntry | FSDirectoryEntry

export class BaseEntry {
  fullPath: FileEntry['fullPath']
  name: FileEntry['name']
  toURL: FileEntry['toURL']
  toInternalURL: FileEntry['toInternalURL']
  nativeURL: FileEntry['nativeURL']

  constructor (public fileSystem: FS, protected entry: SimplestEntry) {
    this.fullPath = entry.fullPath
    this.name = entry.name
    this.toURL = entry.toURL.bind(entry)
    this.toInternalURL = entry.toInternalURL.bind(entry)
    this.nativeURL = entry.nativeURL
  }

  getParent (): Promise<FSDirectoryEntry> {
    return new Promise((resolve, reject) => {
      this.entry.getParent(entry => {
        resolve(new FSDirectoryEntry(this.fileSystem, entry))
      }, rejectFileError(reject))
    })
  }
}

export class FSFileEntry extends BaseEntry {
  public toInternalURL: FileEntry['toInternalURL']
  public toURL: FileEntry['toURL']
  public nativeURL: FileEntry['nativeURL']
  public isFile = true as const
  public isDirectory = false as const
  private meta: Metadata

  constructor (public fileSystem: FS, protected entry: FileEntry) {
    super(fileSystem, entry)
  }

  createWriter (): Promise<FSFileWriter> {
    return new Promise((resolve, reject) => {
      this.entry.createWriter(writer => {
        resolve(new FSFileWriter(writer))
      }, rejectFileError(reject))
    })
  }

  getArrayBuffer (): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      this.entry.file(file => {
        const reader = new FileReader()
        reader.onloadend = function () {
          if (this.result instanceof ArrayBuffer) {
            resolve(this.result)
          } else {
            reject(new Error('Failed to read file as ArrayBuffer'))
          }
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      }, rejectFileError(reject))
    })
  }

  getDataURL (): Promise<string> {
    return new Promise((resolve, reject) => {
      this.entry.file(file => {
        const reader = new FileReader()
        reader.onloadend = function () {
          resolve(this.result as string)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      }, rejectFileError(reject))
    })
  }

  copyTo (parent: DirectoryEntry, newName = this.entry.name): Promise<FSFileEntry> {
    return new Promise((resolve, reject) => {
      this.entry.copyTo(parent, newName, entry => {
        resolve(new FSFileEntry(this.fileSystem, entry as FileEntry))
      }, rejectFileError(reject))
    })
  }

  moveTo (parent: FSDirectoryEntry, newName = this.entry.name): Promise<FSFileEntry> {
    return new Promise((resolve, reject) => {
      this.entry.moveTo(parent.entry, newName, entry => {
        resolve(new FSFileEntry(this.fileSystem, entry as FileEntry))
      }, rejectFileError(reject))
    })
  }

  file () {
    return new Promise<globalThis.File>((resolve, reject) => {
      this.entry.file(resolve, rejectFileError(reject))
    })
  }

  async text (encoding?: string): Promise<string> {
    const file = await this.file()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = function () {
        resolve(this.result as string)
      }
      reader.onerror = reject
      reader.readAsText(file, encoding)
    })
  }

  getMetadata () {
    if (this.meta) {
      return Promise.resolve(this.meta)
    }
    return new Promise<Metadata>((resolve, reject) => {
      this.entry.getMetadata(resolve, rejectFileError(reject))
    }).then(meta => {
      this.meta = meta
      return meta
    })
  }

  async size () {
    const meta = await this.getMetadata()
    return meta.size
  }

  async type () {
    const file = await this.file()
    return file.type
  }

  remove (): Promise<void> {
    return new Promise((resolve, reject) => {
      this.entry.remove(resolve, rejectFileError(reject))
    })
  }
}

type Writeable = FSFileEntry | FileEntry | Primitive
type Primitive = string | number | boolean | Blob | Buffer | ReadableStream

const MAX_WRITE_SIZE = 1024 * 1024
export class FSFileWriter {
  constructor (private writer: FileWriter, private entry: FSFileEntry) {}

  get position () {
    return this.writer.position
  }

  get length () {
    return this.writer.length
  }

  get readyState () {
    return this.writer.readyState
  }

  get error () {
    return this.writer.error
  }

  seek (offset: number) {
    return this.writer.seek(offset)
  }

  truncate (size: number) {
    return this.writer.truncate(size)
  }

  abort () {
    return new Promise((resolve, reject) => {
      this.writer.onabort = resolve
      this.writer.onerror = reject
      this.writer.abort()
    })
  }

  writeJoin (vals: Writeable[], separator = '\n') {
    const merged: BlobPart[] = vals.reduce((agg, line) => {
      if (line instanceof Blob) {
        agg.push(line, separator)
      } else if (line instanceof Buffer) {
        agg.push(line, separator)
      } else {
        agg.push('' + line, separator)
      }
      return agg
    }, [])
    return this.write(new Blob(merged))
  }

  writeLines (lines: Writeable[]) {
    return this.writeJoin(lines)
  }

  writeRaw (data: string | Blob | Uint8Array) {
    return new Promise<void>((resolve, reject) => {
      this.writer.onwrite = () => resolve()
      this.writer.onerror = reject
      this.writer.write(data)
    })
  }

  async writeStream (data: ReadableStream) {
    console.log('writeStream')
    const reader = data.getReader()
    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        break
      }
      await this.writeRaw(value)
    }
  }

  async write (data: Writeable): Promise<void> {
    let val: Primitive
    if (data instanceof Buffer) {
      val = new Blob([data])
    } else if (data instanceof FSFileEntry) {
      console.log('copying file')
      const parent = await this.entry.getParent()
      await data.copyTo(parent.entry, this.entry.name)
      return
    } else if (data instanceof ReadableStream) {
      console.log('writing readablestream')
      return this.writeStream(data)
    } else if (data instanceof Blob || typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      val = data
    } else {
      console.log('resolving file')
      val = await new Promise((resolve, reject) => data.file(resolve, rejectFileError(reject)))
    }
    console.log('full write')

    if (typeof val === 'string' || val instanceof Blob) {
      console.log('calling write with', val)
      return this.writeRaw(val)
    } else {
      const wVal = '' + val
      return this.writeRaw(wVal)
    }
  }
}

export class FSDirectoryReader {
  constructor (private fs: FS, private reader: DirectoryReader) {}

  readEntries (): Promise<FSEntry[]> {
    return new Promise((resolve, reject) => {
      this.reader.readEntries(entries => {
        resolve(
          entries.map(e => e.isDirectory ? new FSDirectoryEntry(this.fs, e) : new FSFileEntry(this.fs, e as FileEntry)),
        )
      }, rejectFileError(reject))
    })
  }
}

export class FSDirectoryEntry extends BaseEntry {
  public entry: DirectoryEntry
  public isFile = false as const
  public isDirectory = true as const

  constructor (public fileSystem: FS, entry: Entry) {
    super(fileSystem, entry)
  }

  getFile (path?: string, opts?: FileSystemGetFileOptions | { exclusive: boolean }): Promise<FSFileEntry> {
    return new Promise((resolve, reject) => {
      console.log('getFile', this.entry.fullPath, path, opts)
      this.entry.getFile(path, opts, entry => {
        resolve(new FSFileEntry(this.fileSystem, entry))
      }, rejectFileError(reject))
    })
  }

  getDirectory (path: string, opts?: FileSystemGetDirectoryOptions): Promise<FSDirectoryEntry> {
    return new Promise((resolve, reject) => {
      this.entry.getDirectory(path, opts, entry => {
        resolve(new FSDirectoryEntry(this.fileSystem, entry))
      }, rejectFileError(reject))
    })
  }

  createReader (): FSDirectoryReader {
    const reader = this.entry.createReader()
    return new FSDirectoryReader(this.fileSystem, reader)
  }

  readEntries () {
    return this.createReader().readEntries()
  }

  async files () {
    const files: FSFileEntry[] = []
    const entries = await this.readEntries()
    for (const entry of entries) {
      if (entry.isFile) {
        files.push(entry)
      }
    }
    return files
  }

  async directories () {
    const dirs: FSDirectoryEntry[] = []
    const entries = await this.readEntries()
    for (const entry of entries) {
      if (entry.isDirectory) {
        dirs.push(entry)
      }
    }
    return dirs
  }

  removeRecursively (): Promise<void> {
    return new Promise((resolve, reject) => {
      this.entry.removeRecursively(resolve, rejectFileError(reject))
    })
  }

  empty (recursive = false) {
    if (recursive) {
      return this.removeRecursively()
    }
    return this.walk(entry => {
      if (entry.isFile) {
        return entry.remove()
      } else if (recursive) {
        return (entry as FSDirectoryEntry).empty()
      }
    })
  }

  async writeFile (path: string, data: Writeable, opts?: FileSystemGetFileOptions): Promise<FSFileEntry> {
    opts = Object.assign({ create: true }, opts)
    const fileEntry = await this.getFile(path, opts)
    if (data instanceof FSFileEntry) {
      return data.copyTo(this.entry, path)
    }
    const writer = await fileEntry.createWriter()
    await writer.write(data)
    return fileEntry
  }

  async walk (handler: (entry: FSEntry) => void | Promise<void>): Promise<void> {
    const entries = await this.readEntries()
    for (const entry of entries) {
      await handler(entry)
    }
  }
}

export class FS {
  public name: string
  public root: FSDirectoryEntry

  constructor (private fs: FileSystem) {
    this.name = fs.name
    this.root = new FSDirectoryEntry(this, (fs.root as unknown) as Entry)
  }

  async mv (fromURL: string, toURL: string) {
    const toDir = path.dirname(toURL)
    const toFileName = path.basename(toURL)
    const from = await this.root.getFile(fromURL)
    const to = await this.root.getDirectory(toDir)
    return from.moveTo(to, toFileName)
  }

  async emptyDirectory (dirURL: string, recursive = false, opts?: FileSystemGetDirectoryOptions) {
    try {
      const entry = await this.root.getDirectory(dirURL, opts)
      return entry.empty(recursive)
    } catch (err) {
      if (err.code === 12) {
        // directory doesn't exist
        return
      }
      throw err
    }
  }

  async resolve (relPath: string) {
    try {
      const entry = await this.root.getDirectory(relPath)
      return entry.nativeURL
    } catch (e) {
      const entry = await this.root.getFile(relPath)
      return entry.nativeURL
    }
  }
}

export class convert {
  static fileSystem (fs: FileSystem) {
    return new FS(fs)
  }

  static fileEntry (entry: FileEntry) {
    return new FSFileEntry(this.fileSystem(entry.filesystem), entry)
  }

  static directoryEntry (entry: DirectoryEntry) {
    return new FSDirectoryEntry(this.fileSystem(entry.filesystem), entry)
  }
}

export class file {
  static async applicationStorageDirectory (dirPath = '', opts?: FileSystemGetDirectoryOptions) {
    const e = await this.resolveLocalFileSystemURL(cordova!.file.applicationStorageDirectory)
    const dir = e as FSDirectoryEntry
    if (dirPath) {
      return dir.getDirectory(dirPath, opts)
    }
    return dir
  }

  static async applicationDirectory (dirPath = '', opts?: FileSystemGetDirectoryOptions) {
    const e = await this.resolveLocalFileSystemURL(cordova!.file.applicationDirectory)
    const dir = e as FSDirectoryEntry
    if (dirPath) {
      return dir.getDirectory(dirPath, opts)
    }
    return dir
  }

  static async dataDirectory (dirPath = '', opts?: FileSystemGetDirectoryOptions) {
    const e = await this.resolveLocalFileSystemURL(cordova!.file.dataDirectory)
    const dir = e as FSDirectoryEntry
    if (dirPath) {
      return dir.getDirectory(dirPath, opts)
    }
    return dir
  }

  static root () {
    return this.resolveLocalFileSystemURL('file:///storage/')
  }

  static cacheDirectory () {
    return this.resolveLocalFileSystemURL(cordova!.file.cacheDirectory)
  }

  static sharedDirectory () {
    return this.resolveLocalFileSystemURL(cordova!.file.sharedDirectory)
  }

  static syncedDataDirectory () {
    return this.resolveLocalFileSystemURL(cordova!.file.syncedDataDirectory)
  }

  static sdCard () {
    return this.resolveLocalFileSystemURL('file:///storage/extSdCard/')
  }

  static persistent (size?: number) {
    return this.requestFileSystem(LocalFileSystem.PERSISTENT, size)
  }

  static temporary (size?: number) {
    return this.requestFileSystem(LocalFileSystem.TEMPORARY, size)
  }

  static requestFileSystem (type: LocalFileSystem, size = 0): Promise<FS> {
    return new Promise((resolve, reject) => {
      window.requestFileSystem(type, size, fs => {
        resolve(new FS(fs))
      }, rejectFileError(reject))
    })
  }

  static resolveLocalFileSystemURL (filePath: string): Promise<FSFileEntry | FSDirectoryEntry> {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(filePath, async entry => {
        resolve(entry.isDirectory
          ? convert.directoryEntry(entry as DirectoryEntry)
          : convert.fileEntry(entry as FileEntry),
        )
      }, rejectFileError(reject))
    })
  }

  static resolveLocalFileSystemURI (filePath: string): Promise<FSFileEntry | FSDirectoryEntry> {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURI(filePath, async entry => {
        resolve(entry.isDirectory
          ? convert.directoryEntry(entry as DirectoryEntry)
          : convert.fileEntry(entry as FileEntry),
        )
      }, rejectFileError(reject))
    })
  }

  static async resolveFileUri (uri: string): Promise<FSFileEntry> {
    const entry = await this.resolveLocalFileSystemURI(uri)
    if (entry.isFile) {
      return entry
    }
    throw new Error('Expected file, got directory')
  }

  static async resolveDirectoryUri (uri: string): Promise<FSDirectoryEntry> {
    const entry = await this.resolveLocalFileSystemURI(uri)
    if (entry.isDirectory) {
      return entry
    }
    throw new Error('Expected directory, got file')
  }

  static isFile (entry: any) {
    return entry && entry.isFile
  }

  static isDirectory (entry: any) {
    return entry && entry.isDirectory
  }
}

export type FsRoot = 'temporary' |
 'persistent' |
 'application' |
 'application-storage' |
 'data' |
 'root' |
 'sdCard' |
 'cache' |
 'shared' |
 'synced'

export async function getFs (root: FsRoot) {
  switch (root) {
    case 'persistent': {
      const fs = await file.persistent()
      return fs.root
    }
    case 'temporary': {
      const fs = await file.temporary()
      return fs.root
    }
    case 'application-storage':
      return file.applicationStorageDirectory()
    case 'application':
      return file.applicationDirectory()
    case 'data':
      return file.dataDirectory()
    case 'root':
      return file.root()
    case 'sdCard':
      return file.sdCard()
    case 'cache':
      return file.cacheDirectory()
    case 'shared':
      return file.sharedDirectory()
    case 'synced':
      return file.syncedDataDirectory()
    default:
      throw new Error(`Unknown root: ${root}`)
  }
}

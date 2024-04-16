import path from 'path'

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

type FSEntry = FSFileEntry | FSDirectoryEntry

export class BaseEntry {
  fullPath: FileEntry['fullPath']
  name: FileEntry['name']
  toURL: FileEntry['toURL']
  toInternalURL: FileEntry['toInternalURL']
  nativeURL: FileEntry['nativeURL']

  constructor (public fileSystem: FS, protected entry: SimplestEntry) {
    this.fullPath = entry.fullPath
    this.name = entry.name
    this.toURL = entry.toURL.bind(this)
    this.toInternalURL = entry.toInternalURL.bind(this)
    this.nativeURL = entry.nativeURL
  }

  getParent (): Promise<FSDirectoryEntry> {
    return new Promise((resolve, reject) => {
      this.entry.getParent(entry => {
        resolve(new FSDirectoryEntry(this.fileSystem, entry))
      }, reject)
    })
  }
}

export class FSFileEntry extends BaseEntry {
  public toInternalURL: FileEntry['toInternalURL']
  public toURL: FileEntry['toURL']
  public nativeURL: FileEntry['nativeURL']
  public isFile: true = true
  public isDirectory: false = false

  constructor (public fileSystem: FS, protected entry: FileEntry) {
    super(fileSystem, entry)
    this.toInternalURL = () => entry.toInternalURL()
    this.toURL = () => entry.toURL()
    this.nativeURL = entry.nativeURL
  }

  createWriter (): Promise<FSFileWriter> {
    return new Promise((resolve, reject) => {
      this.entry.createWriter(writer => {
        resolve(new FSFileWriter(writer))
      }, reject)
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
      }, reject)
    })
  }

  copyTo (parent: DirectoryEntry, newName = this.entry.name): Promise<FSFileEntry> {
    return new Promise((resolve, reject) => {
      this.entry.copyTo(parent, newName, entry => {
        resolve(new FSFileEntry(this.fileSystem, entry as FileEntry))
      }, reject)
    })
  }

  moveTo (parent: FSDirectoryEntry, newName = this.entry.name): Promise<FSFileEntry> {
    return new Promise((resolve, reject) => {
      this.entry.moveTo(parent.entry, newName, entry => {
        resolve(new FSFileEntry(this.fileSystem, entry as FileEntry))
      }, reject)
    })
  }

  file (): Promise<globalThis.File> {
    return new Promise((resolve, reject) => {
      this.entry.file(resolve, reject)
    })
  }

  async text (): Promise<string> {
    const file = await this.file()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = function () {
        resolve(this.result as string)
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  getMetadata (): Promise<Metadata> {
    return new Promise((resolve, reject) => {
      this.entry.getMetadata(resolve, reject)
    })
  }

  remove (): Promise<void> {
    return new Promise((resolve, reject) => {
      this.entry.remove(resolve, reject)
    })
  }
}

type Writeable = Buffer | Blob | string | number | boolean

export class FSFileWriter {
  constructor (private writer: FileWriter) {
  }

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

  write (val: Writeable): Promise<void> {
    return new Promise((resolve, reject) => {
      this.writer.onwrite = () => resolve()
      this.writer.onerror = reject
      if (val instanceof Blob) {
        this.writer.write(val)
      } else {
        const wVal = '' + val
        this.writer.write(new Blob([wVal]))
      }
    })
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
      }, reject)
    })
  }
}

export class FSDirectoryEntry extends BaseEntry {
  public entry: DirectoryEntry
  public isFile: false = false
  public isDirectory: true = true

  constructor (public fileSystem: FS, entry: Entry) {
    super(fileSystem, entry)
    this.entry = entry as DirectoryEntry
  }

  getFile (path?: string, opts?: FileSystemGetFileOptions | { exclusive: boolean }): Promise<FSFileEntry> {
    return new Promise((resolve, reject) => {
      console.log('getFile', this.entry.fullPath, path, opts)
      this.entry.getFile(path, opts, entry => {
        resolve(new FSFileEntry(this.fileSystem, entry))
      }, reject)
    })
  }

  getDirectory (path: string, opts?: FileSystemGetDirectoryOptions): Promise<FSDirectoryEntry> {
    return new Promise((resolve, reject) => {
      this.entry.getDirectory(path, opts, entry => {
        resolve(new FSDirectoryEntry(this.fileSystem, entry))
      }, reject)
    })
  }

  createReader (): FSDirectoryReader {
    const reader = this.entry.createReader()
    return new FSDirectoryReader(this.fileSystem, reader)
  }

  readEntries () {
    const reader = this.createReader()
    return reader.readEntries()
  }

  writeFile (path: string, file: File | Blob, opts: FileSystemGetFileOptions = { create: true }): Promise<FSFileEntry> {
    return new Promise((resolve, reject) => {
      this.entry.getFile(path, opts, entry => {
        entry.createWriter(writer => {
          writer.write(file)
          resolve(new FSFileEntry(this.fileSystem, entry as FileEntry))
        }, reject)
      }, reject)
    })
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
    const entry = await this.root.getDirectory(dirURL, opts)
    return entry.walk(async e => {
      console.log('walking', e.toURL())
      if (e.isFile) {
        await e.remove()
      } else if (recursive) {
        await this.emptyDirectory(e.toURL())
      }
    })
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

export class file {
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
      }, reject)
    })
  }

  static resolveLocalFileSystemURL (filePath: string): Promise<FSFileEntry | FSDirectoryEntry> {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(filePath, async entry => {
        const fs = new FS(entry.fileSystem)
        resolve(entry.isDirectory
          ? new FSDirectoryEntry(fs, entry)
          : new FSFileEntry(fs, (entry as unknown) as FileEntry),
        )
      }, reject)
    })
  }

  static resolveLocalFileSystemURI (filePath: string): Promise<FSFileEntry | FSDirectoryEntry> {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURI(filePath, async entry => {
        const fs = new FS(entry.fileSystem)
        resolve(entry.isDirectory
          ? new FSDirectoryEntry(fs, entry)
          : new FSFileEntry(fs, (entry as unknown) as FileEntry),
        )
      }, reject)
    })
  }
}


export function loadDir<R> (dir: string, ext?: string, recursive = true): Record<string, R> {
  if (recursive) {
    dir = path.join(dir, '**/*')
  }
  if (ext) {
    dir += "."+ext
  }
  console.log('loadDir.vite', dir)
  return import.meta.glob(dir) as Record<string, R>
}
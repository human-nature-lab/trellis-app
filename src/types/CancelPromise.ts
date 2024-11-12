export type CancelPromise<T> = Promise<T> & { cancel: (err?: Error) => void }

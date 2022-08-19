export type CancelPromise<T> = Promise<T> & { cancel: () => void }

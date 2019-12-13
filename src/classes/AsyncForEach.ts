async function asyncForEach<T> (arr: T[], cb: (item: T, index: number) => any): Promise<void> {
  for (let i = 0; i < arr.length; i++) {
    await cb(arr[i], i)
  }
}

export default asyncForEach

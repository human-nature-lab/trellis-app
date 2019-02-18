/**
 * Creates a valid http path with all components of the path properly encoded
 * @param args
 */
export function joinURIEncode (...args: string[]): string {
  return args.map(o => encodeURIComponent(o)).join('/')
}

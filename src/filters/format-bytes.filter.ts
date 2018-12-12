export default function FormatBytes (bytes: number): string {
  if (typeof bytes !== 'number' || isNaN(bytes)) {
    return 'NaN'
  }

  const units: string[] = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const exponent: number = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), units.length - 1)
  bytes = Math.floor( 100 * bytes / Math.pow(1000, exponent)) / 100  // Don't convert to string and back to number

  // Impossible to have a negative number based on the calculation above
  return '' + bytes + units[exponent]
}

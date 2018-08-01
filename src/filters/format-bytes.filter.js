export default function (bytes) {
  if (typeof bytes !== 'number' || isNaN(bytes)) {
    return 'NaN'
  }

  let units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), units.length - 1)
  bytes = (bytes / Math.pow(1000, exponent)).toFixed(2) * 1

  return (bytes < 0 ? '-' : '') + bytes + units[exponent]
}

export default function (val: string): string {
  return val.split(' ').map(v => v.substr(0, 1).toUpperCase().concat(v.substr(1).toLowerCase())).join(' ')
}

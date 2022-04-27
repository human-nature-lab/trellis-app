export const changelog = import.meta.glob('../../../changelog/**/*.md')

for (const key in changelog) {
  const newKey = key.replace('../../../changelog/', '')
  changelog[newKey] = changelog[key]
  delete changelog[key]
}

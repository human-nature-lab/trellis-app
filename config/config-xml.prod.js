module.exports = {
  CONTENT_SOURCE: 'index.html',
  VERSION: require('../package.json').version,
  ACCESS_ORIGIN: '*',
  ALLOW_CLEARTEXT_TRAFFIC: !!process.env.ALLOW_CLEARTEXT_TRAFFIC,
}

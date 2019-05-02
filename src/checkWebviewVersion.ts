const updateWebview = '/update-webview.html'
if ((typeof window['cordova'] === 'object') && navigator) {
  const chromeVersionReg = /Chrome\/(.*) /g
  const match = chromeVersionReg.exec(navigator.userAgent)
  if (match && match.length > 1) {
    const chromeVersion = parseInt(match[1].substr(0, 2), 10)
    console.log('chromeVersion', chromeVersion)
    if (chromeVersion < 68) {
      window.open(updateWebview)
    }
  }
}

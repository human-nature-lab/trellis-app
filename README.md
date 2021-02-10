# Trellis APP

> The Trellis SPA for conducting administered interviews.

---
## Releasing

### Cloud based
Automatic releases are triggered when a new tag matching `v*` is created. This process takes about 5 minutes and is the simplest way to release everything. Find the new release under the releases section in Github.
- `npm version prerelease` OR `npm version minor` OR `npm version major`
- `git push`
- `git push --tags`

### Manual configuration
1. `npm install`
1. [Install Cordova][2] (`npm i -g cordova@8.1.2`)
1. Add `config.js` file in `static/`. Look at `static/config.default.js` for template.
1. Create a `config-xml.prod.js` file in `config/`. The template is `config/config-xml.default.js`.
1. **Optional**: Configure Sentry by adding a `.sentryclirc`file and logging in with `sentry-cli login`. See [Sentry docs][1] for more info.

```
# .sentryclirc
[defaults]
org=your-org-here
project=your-project-here
```

### Web

1. `npm run build:web`
1. Serve files from the `www` directory that gets generated
1. We release web bundles each time we create a new version of Trellis. If you're only interested in deploying Trellis to a server see the documentation for [Trellis API][4] for details on how to use our releases instead.
### Android

#### Debug builds
1. `npm run build:android`
1. Find the generated APK at `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

#### Production builds
1. [Generate a keystore first][3]
1. `npm run release:android -- --storePassword your_store_password --password your_key_password --keystore path_to_keystore --alias your_key_alias`
1. Find the generated APK at `platforms/android/app/build/outputs/apk/release/app.apk`

### iOS
TODO

---
## Development
We welcome pull requests!

### Docker
A simplified Docker configuration for development is in progress. Contact us if you need this now.

### Manual configuration
#### Initial setup
This step is similar to the configuration required to create a release.
1. Add `config.js` file in `static/`. Look at `static/config.default.js` for template. The `apiRoot` should point to your development API server.
1. Add `config-xml.dev.js` file in `config/`. The template is `config/config-xml.dev.default.js`. Point the `CONTENT_SOURCE` to your Webpack development server.

#### Android
1. Start the Webpack development server with `npm start`
1. Make the Android development build with `npm run build:dev:android`. This will install the generated APK on a device or emulator running on the PC. This command only needs to be run the first time you build Trellis or when Cordova plugins are changed.

#### iOS
TODO
### Build Errors
Many errors in the build process are caused by not removing or changing plugins correctly. The simplest remedy is to simply run `cordova platform rm android && cordova platform add android` to reinstall them all with fresh configuration.
You may also need to add the plugins again using `cordova plugin add {name}` after removing and adding the platform.

---
## Testing
### Unit
All unit tests can be run with `npm run unit`. To debug tests in Chrome use `karma start test/unit/karma.conf.js --browsers=Chrome`

### Services
Service tests run in a Cordova app via the **ServiceTesting** component. They run in the Cordova environment so it is easy to test both versions of each service.

---
## Documentation
Trellis documentation is very much a work in progress and we welcome any contributions to these resources by the community. Trellis has an internal documentation viewer which can be accessed from almost anywhere within the application.

Changes to the documentation will automatically reload when developing. Any files that are added should also be added to `_Sidebar.md` so that it can be navigated to directly by any Markdown viewer.

### Creating internal links to the documentation
Update the `src/components/documentation/DocsFiles.ts` to add files to the documentation. Use this file to reference any links to the documentation throughout your code. This will help prevent accidentally creating broken links to documentation. To create a documentation link in the navigation use the `DocsLinkMixin`. This will make the *help icon* link directly to the relevant file for the current view.


[1]: https://docs.sentry.io/product/cli/configuration/
[2]: https://cordova.apache.org/docs/en/latest/guide/cli/#installing-the-cordova-cli
[3]: https://developer.android.com/studio/publish/app-signing
[4]: https://github.com/human-nature-lab/trellis-api#trellis-app

[trellis]: https://github.com/human-nature-lab/trellis

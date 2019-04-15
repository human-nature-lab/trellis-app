# Trellis Interview

> The trellis SPA for conducting interviews

## Development 

### Configuration
- Add **config.js** file in **static/**. Look at **static/config.default.js** for template.
- Add **config.xml.js** file in **config/**. The template is **config/config.xml.default.js**.

### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# Build android app with hot reload serving based on config.xml.js
npm run dev-android

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test

# build for production and cordova build.
npm run cordova-build

# build for production and serve the app through the browser - no hot reload.
npm run browser

# add respective platforms
cordova platform add android
cordova platform add ios

# build for production and serve the app on an iOS device
npm run ios

# build for production and serve the app on an android device (won't serve on a virtual device)
npm run android

# build for production and serve the app on an android device (will serve on a virtual device or physical device - prefers virtual)
npm run android-vm
```

### Build Errors
Many errors in the build process are caused by not removing or changing plugins correctly. The simplest remedy is to simply run "cordova platform rm android && cordova platform add android" to reinstall them all with fresh configuration.
You may also need to add the plugins again using "cordova plugin add {name}" after removing and adding the platform.

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Documentation
The documentation is hosted in the [Trellis wiki](https://github.com/human-nature-lab/trellis/wiki), but it is embedded into the app as a submodule. To grab the docs submodule **the first time** use `git submodule update --init --recursive`. For all subsequent pulls, use `git submodule update --recursive --remote`. From within the docs submodule, you can make changes and push/pull changes to the wiki.

Any files that are added should also be added to `_Sidebar.md` so that it can be navigated to directly.

### Creating internal links to the documentation
Update the `src/components/documentation/DocsFiles.ts` to add files to the documentation. Use this file to reference any links to the documentation throughout your code. This will help prevent accidentally creating broken links to documentation. To create a documentation link in the navigation use the `DocsLinkMixin`. This will make the *help icon* link directly to the relevant file for the current view.

## Releasing
Creating a production release involves a lot of different moving parts. We release to multiple platforms which each have their own configuration files. Most of the release logic has been turned into a single script.

### Base
Do all of these things before building for any of the environments.
1. Bump the version in **package.json**. 3.0.28 elog in the changelog directory. This should be a brief desc-> 3.0.29
1. Write the version changription of the modifications that have been made to the behavior or user interface in Trellis.

### App
1. Do all of the things in the base section
1. Run `node build.js --config=src/config.prod.app.js --apk --sentry-token=${SENTRY_TOKEN} --sentry-org="wyatt-israel"` to build an APK using the supplied configuration file. Token is the API token used for sentry. While not necessary, creating the APK with this flag helps with debugging issues in production.
1. Once it's done, upload the generated APK in the releases directory to the Google Drive directory.

### Web
1. Do all of the things in the base section
1. Run `node build.js --config=src/config.test.web.js --web --sentry-token=${SENTRY_TOKEN} --sentry-org="wyatt-israel"` to bundle files into the www/ directory.
1. Zip these files and upload to the Trellistest server
1. Remove the existing www/ directory in the trellis-web repository
1. Unzip the uploaded zip. This should place these files into the www/ directory to be served by nginx
1. Do the same steps for prod, but use the `src/config.prod.web.js` configuration file instead

## Testing
### Unit
All unit tests can be run with `npm run unit`. To debug tests in Chrome use `karma start test/unit/karma.conf.js --browsers=Chrome`

### Services
Service tests run in a cordova app via the **ServiceTesting** component. They run in the Cordova environment so it is easy to test both versions of each service.

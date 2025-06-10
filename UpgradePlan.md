# High-level plan
1. Reimplement our build process using Vite. This will make it easier to use Vitest for our tests.
2. Upgrade typeorm version. There is a roadblock here with cordova-plugin-sqlite not properly 
   supporting transactions with typeorm. The current version of typeorm is also a roadblock to 
   changing our build process to vite though.
3. Maybe we should just use Capacitor?
   - We have sqlite/typeorm support via capacitor-community/sqlite package
   - Better support for Native Android/iOS APIs
3. We'll create unit and e2e tests for our Vue components
   1. Enforce types for all services
   2. Create mock services for all services
   3. Write unit tests
   4. Write integration tests
4. Upgrade all components to the Composition API available in 2.7.x
5. Verify all tests are passing
6. Upgrade Vue to v3 and Vuetify
   1. Upgrade library versions
   2. Migrate all components to new Vuetify APIs
   3. Update all component tests
7. Verify all tests continue to pass throughout

## Upgrading Vuetify
Looks like [this plugin](https://www.npmjs.com/package/eslint-plugin-vuetify) can do lots of the 
heavy lifting for us.

## Questions
- Which test framework would work/be the easiestfor all tests throughout the upgrade?
    - Vitest is recommended for vue 3 so let's see if that works for vue 2 as well
- Is there a shim for Vuetify 2 backward support with Vuetify 3? NO, but there is a plugin to help
  make the changes
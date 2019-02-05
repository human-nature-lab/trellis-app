#!/usr/bin/env bash
TOKEN="***REMOVED***"
node --experimental-modules build.js --config=src/config.prod.app.js --apk --skip-sentry --sentry-token=${TOKEN} --sentry-org="wyatt-israel"
#node --experimental-modules build.js --config=src/config.prod.web.js --web --sentry-token=${TOKEN} --sentry-org="wyatt-israel"

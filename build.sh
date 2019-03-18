#!/usr/bin/env bash
TOKEN="***REMOVED***"
node build.js --config=src/config.prod.app.js --apk --sentry-token=${TOKEN} --sentry-org="wyatt-israel"
#node build.js --config=src/config.prod.web.js --web --sentry-token=${TOKEN} --sentry-org="wyatt-israel"

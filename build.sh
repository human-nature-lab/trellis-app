#!/usr/bin/env bash
TOKEN="469eb1e330104fb88333835781c4711e73e2658ffaf14a8f887f6105b3477135"
node build.js --config=src/config.prod.app.js --apk --sentry-token=${TOKEN} --sentry-org="wyatt-israel"
#node build.js --config=src/config.prod.web.js --web --sentry-token=${TOKEN} --sentry-org="wyatt-israel"

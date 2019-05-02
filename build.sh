#!/usr/bin/env bash
TOKEN="***REMOVED***"
./build.js --release --apk --sentry-token=${TOKEN} --skip-release
#node build.js --config=src/config.test.web.js --web --sentry-token=${TOKEN} --sentry-org="human-nature-lab"

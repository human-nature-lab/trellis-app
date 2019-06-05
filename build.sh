#!/usr/bin/env bash
./build.js --release --apk --sentry-token=${SENTRY_TOKEN} --skip-release
#node build.js --config=src/config.test.web.js --web --sentry-token=${TOKEN} --sentry-org="human-nature-lab"

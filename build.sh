#!/usr/bin/env bash
TOKEN="469eb1e330104fb88333835781c4711e73e2658ffaf14a8f887f6105b3477135"
./build.js --release --apk --sentry-token=${TOKEN} --skip-release
#node build.js --config=src/config.test.web.js --web --sentry-token=${TOKEN} --sentry-org="human-nature-lab"

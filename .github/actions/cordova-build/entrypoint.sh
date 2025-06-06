#!/bin/bash
set -e # exit on error
set -x # echo commands

echo "pwd: $(pwd)"
echo "ls -la: $(ls -la)"
echo "gradle: $(which gradle)"
echo "gradle version: $(gradle --version)"

chmod +x -R hooks/*.sh

npm ci
cp static/config.default.js static/config.js
cp config/config-xml.dev.default.js config/config-xml.dev.js

npm run build:web
zip -r trellis-web.zip www/

# fix platform permissions before building
mkdir -p platforms && chmod -R 777 platforms/
mkdir -p plugins && chmod -R 777 plugins/
npm run setup:cordova
sh cordova-setup.sh

chmod -R 777 platforms/
chmod -R 777 plugins/

npm run webpack:release:android
mv platforms/android/app/build/outputs/apk/debug/app-debug.apk trellis-debug.apk
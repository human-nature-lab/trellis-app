cordova plugin rm cordova-plugin-device
cordova plugin rm cordova-plugin-camera
cordova plugin rm cordova-plugin-file
cordova plugin rm cordova-plugin-file-md5
cordova plugin rm cordova-plugin-zip
cordova plugin rm cordova-plugin-splashscreen
cordova plugin rm cordova-plugin-whitelist
cordova plugin rm cordova-sqlite-storage
cordova plugin rm cordova-plugin-file-transfer
cordova plugin rm cordova-plugin-geolocation
cordova plugin rm cordova-plugin-zeep
cordova plugin rm phonegap-plugin-barcodescanner
cordova plugin rm cordova-plugin-google-nearby-connections

cordova platform rm android
cordova platform rm ios

cordova clean

cordova platform add android@11

cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-camera
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-file-md5
cordova plugin add cordova-plugin-zip
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-sqlite-storage
cordova plugin add cordova-plugin-file-transfer
cordova plugin add cordova-plugin-geolocation
cordova plugin add cordova-plugin-zeep
cordova plugin add @red-mobile/cordova-plugin-barcodescanner
cordova plugin add https://github.com/human-nature-lab/cordova-plugin-google-nearby-connections.git

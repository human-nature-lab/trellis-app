# Information
The information module in Trellis presents general information about the current version of Trellis and the system 
running it. This module shows different things depending on whether it is the mobile or web version of Trellis. 

## Web
On the web, the information module will only show the current server configured and the current version of Trellis.

## Mobile
In the mobile app, the information module will be broken into submodules with useful information in each of them.

### Device
- Version
  - The current version of Trellis
- Device ID
  - The unique ID assigned to this device by the operating system
- Server URL
  - The server that this installation of Trellis has been configured to sync with
  
### Uploads
- Pending photos
  - The number of photos that are waiting to be uploaded to the server
- Pending rows
  - The number of database rows in this database that have not been synced with the server
  
### Storage
- Device photos
  - The number of photos present on this device
- Database photos
  - The number of photos in the database. Ideally, this number should match the number of device photos
- Photos size
  - The amount of storage that the photos are currently using on this device
  
### GPS
- Status
  - The current status of the GPS on this device. After GPS has been turned on, it can take some time for the 
    GPS to actually acquire a "fix". A "fix" occurs once the device has successfully locked in communication with 
    three or more GPS satellites so that the device can calculate its position. Acquiring a "fix" my take longer 
    or be impossible indoors or even in some outdoor locations.
- Last update
  - How long it has been since the last GPS update happened.

### Logs
Click on this module for more detailed logging information.
- Logs
  - The total number of logs stored currently on this device. Each device keeps separate logs for errors and other 
    debug information.
- Uploaded
  - The number of logs that have been uploaded to the server. Logs are not uploaded by default, but can be uploaded 
    via the [logs](Logs.md) module.
  
### Admin
- Unregister device
  - This is the button to click if you want the device to revoke its own access to the server which it is configured
    to communicate with.

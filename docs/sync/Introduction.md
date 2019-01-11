# Syncing
The Trellis platform works both online and offline (mobile app only). The *sync* (meaning synchronization) is the act of resolving the differences between an offline copy of the database (stored on the mobile app) and the central database stored on the server. The synchronization process happens in two steps: the upload, and the download.


## Upload
First, each of the mobile devices upload the changes they have made to the database to the server. They are stored as "PENDING" uploads on the server. Once all of the tablets with local changes have uploaded, an admin user must process them. This is done by clicking the "PROCESS UPLOADS" button. This step merges all of the changes that each mobile device made with the database on the server. The end result is a database with all of the changes from each tablet.

## Download
Second, once the uploads have been processed, a new snapshot needs to be created. Do this by clicking the "GENERATE SNAPSHOT" button. Once the snapshot has been created it must be downloaded onto each mobile device. Each mobile device replaces their local database with a copy of the database from the server which includes changes from any other mobile devices.

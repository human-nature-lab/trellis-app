# Sync administration
The data synchronization feature of Trellis allows surveyors to collect data using devices in areas without Internet
connectivity and upload collected data when they are online. Study administrators use the Sync control panel on the
web app to generate snapshots of the current database and process uploaded data. 

The sync process is as follows:

1. Click the **Generate Snapshot** button in the Sync control panel to create a snapshot of the database.
2. On each device, go to the Sync screen and click the Download button to download the latest snapshot.
3. When the download completes the devices are ready for offline data collection.
4. Go to the Sync screen and click the Upload button to upload any collected data.
5. Click the **Process Uploads** button to add the uploaded data to the server's database.
5. After you have processed the uploaded data, generate a new snapshot with the combined data collected by all devices.

### Snapshots
The **Snapshots** table displays the date and filename of database archives that have been previously generated. 

The **Generate Snapshot** button will create a copy of the server's database that registered devices can download.

### Uploads
The **Uploads** table displays data the data that has been uploaded by devices along with the upload date, file name,
device name and ID, and upload status.

The upload status can be one of the following:

- PENDING: This is an upload that has been uploaded by the device but has not yet been processed. Clicking the 
**Process Uploads** button will add data from all pending uploads to the database.
- SUCCESS: This upload has been successfully processed. Click the arrow 
(<i class="icon material-icons black--text">keyboard_arrow_right</i>) the the left of a successfully processed upload
to display a summary of the data that was uploaded.
- ERROR: If there is an error during the upload process you will have to contact your study 
administrator for a resolution. Click the arrow (<i class="icon material-icons black--text">keyboard_arrow_right</i>) 
to display more information about the error.

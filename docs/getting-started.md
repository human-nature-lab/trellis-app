# Getting started
Trellis is a suite of software tools for developing, administering, and collecting survey and social network data. What 
separates Trellis from other survey tools is its support for mapping social networks and its ability to integrate them 
with survey data.

This guide will walk you through creating a new study, authoring a form, adding you first respondent, and administering
a survey.

## Setting up a study

*Note: If you are not an administrator-level user or are working your way through the getting started guide on the
Trellis demo server, you should have already been assigned a study and can skip this step. If you do not have an 
assigned study, contact the study administrator.*

1. Open the side menu and click the Studies menu item under the Admin heading. *If the Admin sub-menu does not appear,
   log in as a user with the Admin role.*
2. Click the "+" button in the upper-right corner of the Studies table.
3. Enter a name for the study, set a default level of photo JPEG compression from 0 - 100 (see 
   [effects of JPEG compression](https://en.wikipedia.org/wiki/JPEG#Effects_of_JPEG_compression)), and input the default 
   language. 
4. Click "Save'
5. Add any additional languages you want to translate respondent facing text into by typing them into the Languages 
   field. 
6. Select the newly added study by clicking "Change study" in the main menu.


## Creating a form

1. Ensure you're in "Test Mode" (<i class="icon mdi mdi-test-tube-empty"></i>) by checking the box in the sidebar
2. Click Forms in the main menu. 
3. There are two different tables: Forms, and Census Forms.
    * Forms: these are standard forms used for data collection. They will appear in the Forms menu associated with each
      respondent in your study.
    * Census Forms: these forms are automatically started when certain actions are taken by the surveyor, including: 
      adding a respondent to the study, adding a location to the study, moving a respondent, renaming a respondent, or
      adding an associated respondent. 
4. Click the plus (<i class="icon mdi mdi-plus"></i>) icon in the upper right of the table of the form 
   type you wish to create.
5. Click the pencil (<i class="icon mdi mdi-pencil"></i>) icon, edit the name of the form, and click the
   save (<i class="icon mdi mdi-content-save"></i>) icon. Select the language in the drop down menu to 
   translate the form's display name.
6. *If you are creating a census form, select the event that will trigger the display of this form in the "Census type" 
   drop-down list.
7. Open the actions (<i class="icon mdi mdi-dots-vertical"></i>) menu and click the pencil icon to open
   the form builder. See the [form builder documentation](../form-builder/Introduction.md) for instructions for editing
   your form.
8. When you have finished editing the form, return to the forms page and check the "Published" checkbox to activate the 
   form for your study.

## Previewing a form
The form preview allows you to see what the form will actually look like when it is being
administered without actually storing any data in the database. Data is created, but it only
exists as long as the preview tab stays open. From here you can try the entire form and check 
that it is behaving as expected. To access the form preview, click the "Preview Form" button in the actions menu (<i class="icon mdi mdi-dots-vertical"></i>).

## Publishing the form
Once the form is ready, it needs to be published to collect data. Click the publish button in the 
actions menu (<i class="icon mdi mdi-dots-vertical"></i>) to create a new, published version of the
form. Each time a form is published a new version of that form is created. This allows you to make 
changes to the forms without fear of effecting ongoing data collection with already published 
versions.

## Snapshot download
Once the form is ready to be administered, it must be downloaded to the tablet as part of the sync
process. The first step in the sync process is to create a snapshot in the [sync module] by clicking the "GENERATE SNAPSHOT" button. Once the snapshot has been created, download the snapshot onto the tablet using the download (<i class="icon mdi mdi-download"></i>) button.

## Creating a respondent
A form must be associated with a respondent. Go to the respondent's module to [create one](respondents/Add-new-respondent.md) if none have been created yet.

## Administering a form
After syncing and logging into the tablet, you can start the form with one of your respondents. 
Click a respondent in the respondents module and navigate to their forms. Click on the form you 
would like to administer to get started. 

## Data upload
Once you've finished completing the survey in the the mobile app, it's time to upload it back to the
server. Go back to the [sync module] and press the upload button (<i class="icon mdi mdi-upload"></i>). This will create a file of the changes made to your tablet database (called an upload file) and
send that to the server.

Once the data is on the server, there will be an unprocessed upload in the uploads table of the [sync module] on the server. Check the box next to the upload that should be processed and click "PROCESS UPLOADS". This runs the process that actually places that data into the server database.

## Reports
Retrieving data is done via the [reports module]. The data for each form can be downloaded as a [CSV](https://en.wikipedia.org/wiki/Comma-separated_values) for further processing. Additional information is in the [reports module].


[sync module]: sync/Introduction.md
[reports module]: reports/Introduction.md
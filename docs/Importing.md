# Importing data
Data can be imported via the Reports dialog. All imports happen as a transaction. This means that either all of data is imported into the database or none of it is. Some common errors with imports have to do with not using unique ids or incorrectly naming image files. 

## Respondents
Respondents can be imported in bulk using a CSV file. The columns for the CSV should have two columns with the headers "id" and "name". The "id" will be used to connect other imported data with this respondent. Respondent photos can be imported and are matched with respondents by this id.
          
## Respondent photos
Respondent photos can be imported in bulk by uploading a ZIP file with respondent photos named with the id of the respondent they belong to. This id is the same id used when uploading respondents.
          
## Locations
Locations can be imported in bulk using a CSV file. The CSV should have the following columns: id, name, geo_type, latitude, longitude, altitude. Optionally include the parent_id column to assign a location to a parent. All of the supplied ids must be unique for this study.
     
## Location photos
Photos can be added to locations in bulk by uploading a ZIP file filled with JPGs. The name of the photos should be identical to the id provided in the location import or it can also be the internal, unique id assigned by Trellis. The same photo can be assigned to a location twice so be careful to not upload twice.

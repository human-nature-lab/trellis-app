# Importing data
Data can be imported via the Reports dialog. All imports occur as a single transaction. This means that either all of data is imported into the database or, in the event of an error, none of it is. Some common errors with imports include not using unique ids or incorrectly naming image files. 

## Respondents
Respondents can be imported in bulk using a CSV file. The columns for the CSV should have two columns with the headers `id, name`. The `id` field can be used to connect other imported data with this respondent. Trellis will create an additional, unique id for each respondent which it uses internally.
          
## Respondent photos
Respondent photos can be imported in bulk by uploading a ZIP file filled with JPGs. Each image filename should match the `id` of the respondent they belong to. This id can either be the same id used when importing the respondents or it can be the internal id used by Trellis.
          
## Respondent condition tags
Respondent condition tags can be assigned in bulk by uploading a CSV file with the following columns: `respondent_id, condition_tag`. The `respondent_id` should be the id used when importing the respondents or it can be the internal id used by Trellis. The `condition_tag` column can be any alphanumeric text which classifies a respondent in some way. See [Conditions](../form-builder/Conditions.md) for more information.
          
## Locations
Locations can be imported in bulk using a CSV file. The CSV should have the following columns: `id, name, geo_type, latitude, longitude, altitude`. Optionally include the `parent_id` column to assign a location to a parent location. All of the supplied ids must be unique for each study.

#### Importing a location hierarchy
Due to the nature of the import, all parent locations should be imported first or be at the top of the CSV file. For example, if the data being imported consists of States and Cities where all Cities belong to one State, it is necessary to place all of the States at the top of the CSV. Alternatively, the Cities and States could be imported separately with the States being imported **first**. It is important that the parents are imported before the children.
          
## Location photos
Photos can be added to locations in bulk by uploading a ZIP file filled with JPGs. The filename of each photo should match the id provided in the location import. Alternatively, the filenames can match the internal id of the location they should be assigned to. This is helpful if you want to add photos to locations which were not imported into the database. The same photo can be assigned to a location twice so be careful to not upload the same data multiple times.

## Respondent locations
Respondents can be assigned to locations in bulk by uploading a CSV file with the following columns: `id, geo_id, primary`. The `id` is the internal id of the respondent or the assigned id that was used when the respondent was imported. Likewise, the `geo_id` is the 

## Preload data
Surveys can have prefilled data which will is shown when they start a new survey. This data is linked using the question and respondent that the data should be associated with. The following examples are actions that can be preloaded and the question types they are valid for.
  - select-choice => multiple_choice, multiple_select
  - other-choice-text => multiple_choice, multiple_select
  - number-change => decimal, integer
  - add-edge => relationship
  - no-one => relationship
  - add-roster-row => roster,
  - set-val => text, text_area
  - add-geo => geo
  - add-photo => image
  - set-date => year, year_month, year_month_day, year_month_day_time
  - set-text => text, text_area
  - set-time => time, year_month_day_time

### Roster preload example

#### By question id
| respondent_id | question.id | action_type | roster.val |
|--------------|-------------|-------------|------------|
| 0c927692-c449-45c9-a999-f1447c0f2883 | e449d86c-466d-4c04-8b8e-1f13effbdb8b | add-roster-row | child one |
| 0c927692-c449-45c9-a999-f1447c0f2883 | e449d86c-466d-4c04-8b8e-1f13effbdb8b | add-roster-row | child two |

#### By question var_name of "children"
| respondent_id | question.var_name | action_type | roster.val |
|---------------|-------------------|-------------|------------|
| 0c927692-c449-45c9-a999-f1447c0f2883 | children | add-roster-row | child one |
| 0c927692-c449-45c9-a999-f1447c0f2883 | children | add-roster-row | child two |


### Relationship preload example
| respondent_id | question.id | action_type | edge.target_respondent_id | edge.source_respondent_id |
|--------------|-------------|-------------|------------|-------------|
| 0c927692-c449-45c9-a999-f1447c0f2883 | e449d86c-466d-4c04-8b8e-1f13effbdb8b | add-edge | 0c927692-c449-45c9-a999-f1447c0f2883 | 12689236-3c85-4eb0-b03f-e0a23735fde1 |

### Text preload example
| respondent_id | question.var_name | action_type | payload.val |
|--------------|-------------|-------------|------------|
| 0c927692-c449-45c9-a999-f1447c0f2883 | fav_book | set-text | Shadow of the Wind |
| 0c927692-c449-45c9-a999-f1447c0f2883 | fav_book | set-text | The Road |

### Photo preload example
| respondent_id | question.var_name | action_type | photo.id |
|--------------|-------------|-------------|------------|
| 0c927692-c449-45c9-a999-f1447c0f2883 | selfie | add-photo | e449d86c-466d-4c04-8b8e-1f13effbdb8b |

### Select preload example
| respondent_id | question.var_name | action_type | choice.val |
|--------------|-------------|-------------|------------|
| 0c927692-c449-45c9-a999-f1447c0f2883 | best_pets | select-choice | cats |
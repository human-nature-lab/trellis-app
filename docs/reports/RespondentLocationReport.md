# Respondent location report
Trellis allows more than one location to be affiliated with a respondent. This allows Trellis to capture locations of more than one type and associate them with a respondent. One location can also be marked as the primary location.

A simple example would be asking a respondent to identify their workplace and their home separately. These assigned locations can be used to filter the available alters for relationship question types to only include respondents that are shared with the ego. This report includes all of the locations assigned to each respondent in a study. 

## Fields
| Column | Type | Description |
| --- | --- | --- |
| id | UUID | The unique identifier used throughout the database |
| respondent_id | UUID | The respondent's unique id |
| geo_id | UUID | The locations's unique id |
| previous_respondent_geo_id | UUID | The id of the previous respondent location. This is for tracking how the respondent's locations have changed. |
| is_current | boolean | Indicates if this is the primary location for this respondent |
| notes | text | Any notes associated with this respondent location. |
| updated_at | date | The date this location was updated. Same as created_at date. |
| created_at | date | The date this location was assigned to the respondent |
| deleted_at | date | The date this location was removed from the respondent |

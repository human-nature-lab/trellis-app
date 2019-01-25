# Respondent report
The respondent report is a list of all of the respondents in a study. This report also includes all of the [respondent condition tags](../form-builder/ConditionTags.md) that have been assigned to a respondent.

## Base fields
All respondent reports will have the following columns

| Column | Type | Description |
| --- | --- | --- |
| respondent_id | UUID | The unique identifier for this respondent used throughout the database |
| respondent_name | text | The respondent's name |
| created_at | date | The date that this respondent was created |
| updated_at | date | The date that this respondent was updated |
| current_geo_id | UUID | The id of the location this respondent is assigned to. |
| current_geo_name | text | The name of the location this respondent is assigned to. |
| current_geo_type | text | The type of the location this respondent is assigned to. |
| associated_respondent_id | UUID | If the respondent is an "other" respondent then this is the respondent they are affiliated with. |

### Respondent condition tag columns
All respondent condition tags that have been assigned to at least one respondent will appear as their own column. For example, I have assigned a biological sex to all of my respondents using the condition tags "is_female" and "is_male." Each of these will appear as additional columns in the respondent report.

| respondent_id | ... | is_female | is_male |
| --- | --- | --- | --- |
| 145q-07600e7a-a273-480a-a50d-easdffb32bee | ... | 1 | |
| 145q-0a5dddd3-0f4b-5413-bac7-qwerjhftu245 | ... | | 1 |
| 1236-0a5aaaa3-0f4b-5413-bac7-asdfasdfasdf | ... | | 1 |


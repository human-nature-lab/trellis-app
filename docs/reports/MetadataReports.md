# Metadata reports
Several metadata reports are generated within the context of a single survey report.

## Form metadata report
This report has a machine generated description of all of the columns present in the 

### Base fields
These fields will be the same in every form metadata report.
| Column | Type | Description |
| --- | --- | --- |
| header | text | The exact column name this field refers to in the affiliated [survey report](SurveyReports.md).
| question_type |
| variable_name |

### Translation fields
There will be one column associated with each language assigned to the study following the format `question_{language_name}` where language name might be "english" or "spanish".

Example:

| header | ... | question_english | question_spanish |
| --- | --- | --- | --- |
| fav_fruit | ... | What is your favorite fruit? | ¿Cuál es tu fruta favorita?


## Notes metadata report
When a respondent selects "Don't know" or "Refused" choices on a question, they are required to enter a text response indicating why they have chosen to respond this way. This report holds that information.

| Column | Type | Description |
| --- | --- | --- |
| question | text | The column name for this "Don't know" or "Refused" response.
| survey_id | UUID | The survey id
| respondent_master_id | UUID | The respondent id.
| response | text | The text contents of the "Don't know" or "Refused" response.

## Other metadata report
"Multiple choice" and "Multiple select" questions allow for some choices to be marked as "other" responses. These "other" responses allow the respondent to enter any text they wish and select it as a choice. These values are represented in this report.

| Column | Type | Description |
| --- | --- | --- |
| question | text | The column name for this "other" response. This column will be present in the associated [survey report](SurveyReports.md).
| survey_id | UUID | The survey id.
| respondent_master_id | UUID | The respondent id.
| response | text | The content of the "other" response.

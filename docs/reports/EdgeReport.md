# Edge report
The edge report is a list of all of the ego/alter relationships that have been created within a study. Only edges that are affiliated with a question and survey show up in this report, but it is possible for other edges to be present in the database.

## Fields
| Column | Type | Description |
| --- | --- | --- |
| id | UUID | The unique identifier used for this edge throughout the database
| ego | UUID | The respondent id of the ego.
| ego_name | text | The name of the ego.
| alter | UUID | The respondent id of the alter.
| alter_name | UUID | The name of the alter.
| question | text | The "var_name" of the question that created this edge.
| survey_updated_at | date | The date the survey associated with this edge was updated.
| question_dk_rf | boolean | True indicates that the question which created this edge had the response "Don't know" while False indicates that the edge had "Refused". Being empty means this edge is valid.
| question_dk_rf_response | text | The text response associated with the "Don't know" or "Refused" response.
| survey | UUID | The id of the survey which created this edge.

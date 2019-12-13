# Timing report
The timing report is used to show start and end times for each response.

## Fields

| Column | Type | Description |
| --- | --- | --- |
| interview_id | UUID | The unique identifier for this interview used throughout the database.
| survey_id | UUID | The survey that this interview is associated with. |
| respondent_id | UUID | The respondent that this interview is associated with.
| question_id | UUID | The question id |
| form_id | UUID | The form that this question is associated with
| user_id | UUID | The id of the user conducting this interview
| user_name | text | The name for this user
| user_username | text | The username for this user
| question_type | text | The type of question that was responded to
| question_name | text | The var_name for this question
| created_at | date | The time that this page was first visited
| updated_at | date | The time that this response was updated. This will match the **created_at** time unless a respondent selected "Don't Know" or "Refused" or "No One" responses. 
| deleted_at | date | The time that this response was removed. A response will only be removed if a response was changed which caused this question to be skipped.
| last_response_time | date | The last time that a data point was added or updated for this question. This field will be empty for question types that don't have any responses (e.g. intro question types).

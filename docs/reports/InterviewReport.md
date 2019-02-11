# Interview report
The interview report represents all of the interviews associated with a study. An interview represents a "session" in which data was collected for a survey, but it does not necessary represent the complete set of data captured in a survey. A survey can have one or more interviews associated with it and each of these interviews indicates which user was responsible for collecting that data during the period of an interview.

## Fields

| Column | Type | Description |
| --- | --- | --- |
| interview_id | UUID | The unique identifier for this interview used throughout the database.
| survey_id | UUID | The survey that this interview is associated with. |
| respondent_id | UUID | The respondent that this interview is associated with.
| form_id | UUID | The form that this interview is associated with.
| form_name | text | The name of the form that this interview is associated with.
| user_id | UUID | The user that this interview is associated with.
| user_name | text | The full name of the user associated with this interview.
| user_username | text | The username of the user.
| latitude | number | The latitude of the location this interview was started at.
| longitude | number | The longitude of the location this interview was started at.
| altitude | number | The altitude of the location this interview was started at.
| start_time | date | The date the interview started.
| end_time | date | The date the interview ended.
| created_at | date | The date the interview was created.
| updated_at | date | The date the interview was updated.
| deleted_at | date | The date the interview was deleted.
| dk_count | number | The count of "Don't know" responses in the interview.
| rf_count | number | The count of "Refused" responses in the interview.

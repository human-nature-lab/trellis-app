# Survey reports
Almost all of the data in Trellis is collected in the context of a survey. These reports are generated on a per-form basis with each row in the report representing the responses to a single survey. The names of the reports will correspond with the names of each form. 

The columns for these reports will vary depending on the questions and structure of the form. See [question types](#QuestionTypes) for details on the output of each question type. Each column will start with the variable name assigned to that question in the form. 

**NOTE** Survey reports also create several [metadata reports](MetadataReports.md).

## Base fields
These fields appear in all Survey reports.

| Column | Type | Description |
| --- | --- | --- |
| survey_id | UUID | The unique identifier for this survey used throughout the database.
| respondent_id | UUID | The respondent id.
| created_at | date | The date that this survey was created.
| completed_at | date | The date that this survey was completed.

## Repeated sections
TODO

## Follow up sections
Follow up sections collect data that reference responses to another question within the same survey. If a section is a [follow up section](../form-builder/Introduction.md#follow-up-sections) all of the responses to that section will have a suffix attached to the column name. The suffix will be of the form `_rDD` where `DD` represents the current index of the follow up section.

Ex:
A section containing three questions follows up to a roster question which has a maximum of two responses. The data will look like this.

| lunch_foods | is_healthy_r01 | is_healthy_r02 | is_delicious_r01 | is_delicious_r02 |
| --- | --- | --- | --- | --- |
| candy corn;spinach | no | yes | yes | no |
| brussel sprouts | yes | | yes | | 

The suffix `_r01` references the first value in `lunch_foods` so the first respondent has entered "candy corn" and "spinach" as foods they had for lunch. When asked if "candy corn" was healthy and if it was delicious, they responded "no" and "yes" respectively. When asked the same thing for "spinach" they responded "yes" and "no" respectively. The second respondent ate "brussel sprouts" for lunch and answered "yes" for both follow up questions.  

## Question type output

#### Text / Text area
A text question type will output a single column with the response to that question.
#### Decimal / Integer
A number question type will output a single column with the response to that question.
#### Time
A time question will output the the time in 24hr format. 
    
    Ex: "13:49" for 1:49PM
#### Year / Year month / Year month day / Year month day time
A date question will output the date in the format: `YYYY-MM-DD`
    
    Ex: 2018-04-15
#### Multiple choice
The output for a multiple choice question is a single column with the selected choice.

#### Multiple select
A multiple select question will output a matrix where there is one column for each choice in the question. The columns will follow the naming convention "{var_name}_{choice_val}".

   Ex: A question with var_name of "best_animals" with the choice values of "dog", "cat" and "bird" would have the output:
    
| respondent_id | best_animals_dog | best_animals_cat | best_animals_bird |
| ------------- | ---------------- | :--------------: | ----------------- |
| Wyatt | | 1 | |
| Mark  | | 1 | |

#### Image
This question outputs a semi-colon delimited list of image filenames referencing the photos that were taken or uploaded.

Ex:

| photo_var_name |
| :--- |
|0001-12346-12341-12346.jpg;123234-642346-12341-12344.jpg|
 
#### Geo
Geo questions can reference one or more locations within the database. In the reports they will appear as a semi-colon delimited list of names.

Ex:

| geo_var_name |
| --- |
| mark_house;wyatt_house |

#### Relationship (name generator)
Relationship questions can reference one or more respondents within the database. These are represented as a semi-colon delimited list of respondent ids for each alter. This must be joined with the [respondent report](RespondentReport.md) to get other information about the alter, like their name.

Ex:

| best_friends |
| --- |
| a76da082-0c9f-4727-beff-1e44356fbedf;zOk1-c38a1444-82as-4d58-84a7-3fa32fa4e6a7 |
| zOk23-c38a1444-82bb-4d58-84a7-3fa3f2a4e6a7 |


#### Roster
Roster questions can have one or more text type responses. These are represented as semi-colon delimited list of the responses.

Ex:

|fav_foods|
| --- |
| fish;spinach;broccoli |
| candy;candy canes;candy corn;syrup |


#### Respondent geo
TODO

#### Intro
This question type does not create a data point.

#### Group
Not implemented




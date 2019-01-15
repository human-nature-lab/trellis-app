# Question types
Different question types represent different kinds of data. By default all questions allow the respondent to enter a "Don't know" or "Refused" response. This behavior can be disabled using [question parameters](Question-parameters.md).

#### Text / Text area
Text area questions are simple text entry fields. The difference between them is the size of the text entry box. Use "Text area" if you are expecting several sentences as a response or use the "Text" type if you're expecting a short response.
#### Decimal / Integer
Decimal and integer question types represent numbers. Decimal question types represent data that can have decimals in them like "3.14159" or "-0.12345". Integer question types cannot have decimals present. Minimum and maximum values can be controlled using [question parameters](Question-parameters.md).
#### Time
Time question types are used to collected a single time of day without a date attached to it. Times are stored without a timezone using UTC (Coordinated Universal Time).
#### Year / Year month / Year month day / Year month day time
These question types are accurately represented by their names. A year question type could be used to collection data like the respondent's year of birth, while the subsequent question types collect gradually more specific date and time information.
#### Multiple choice / Multiple select
These questions present multiple choices to a respondent in a list. Multiple choice questions only allow the respondent to select a single choice while the multiple select question type allows for multiple responses to be selected. This behavior can be controlled more finely using [question parameters](Question-parameters.md). Look and the "exclusive" and "other" question parameters.
#### Intro
This question type is used to display a block of text that does not require a response. Typically this is used for an introduction or description, but it can be placed anywhere within the form.
#### Image
This question type is for taking and/or uploading one or more images. 
#### Geo
This question type allows respondents to select a location that exists within the study database. Typically, this would be used to identify a respondent's hometown or something similar.
#### Relationship (name generator)
Relationship question types allow the respondent to select one or more respondents that exist within the study. This effectively creates an "edge" within a social network.
#### Roster
Roster question types allow for multiple text entries to be submitted by a respondent.
#### Group
Not implemented

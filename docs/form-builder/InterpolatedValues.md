# Interpolated values
Sometimes it is desirable to have a previous response show up within a question. Trellis accomplishes this using a 
technique called "string interpolation". Trellis forms have a simple syntax for string interpolation based on other
data in the survey. This data can either come from other questions within the survey or it can come from 
[respondent fills](../respondents/RespondentInfo.md#Respondent-fills). 

The syntax for interpolation is square brackets surrounding the "key" for the data it should be replaced by. The "key"
is the question's `var_name` if we're looking for data from a question or it's the `name` of a respondent fill.

Consider the following two question example:

A form has asked the question, "What is your favorite kind of animal?" which has a `var_name` of "fav_animal". 
The next question asks, "What color is the best for a `[fav_animal]`?". If the respondent answered "dog" as their
favorite animal, the following question text would be, "What color is the best for a dog?"

### Follow up sections
This type of interpolation is most commonly used in the context of [follow up sections](Sections.md) which are
frequently used to ask specific questions about previous responses. In the context of a follow up section, the 
interpolated value will change depending on the current repetition of the section. If the section is following up
to a question with a `var_name` "best_friends" then all text in the follow up section with the text
`[best_friends]` would be replaced with the friend's name for that repetition.

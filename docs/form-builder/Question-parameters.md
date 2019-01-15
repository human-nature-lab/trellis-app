# Question parameters

#### min / min_relationships / min_geos / min_roster
The min parameter signifies different things depending on the question type. For integer and decimal question types it indicates the minimum value for that response, but for questions which allow multiple entries (relationship, geo, roster) the parameter controls the minimum number of responses allowed. 

For example, on integer and decimal question types setting `min = 0` would disable negative entries. Setting `min_relationships = 1` would require at least one response to be entered for that question.

#### max / max_relationships / max_geos / max_roster
The max parameter has the same behavior as the min parameter, but it controls the maximum value for number question types and the maximum number of entries for questions which allow multiple entries.

For a number question type, setting `max = 100` would prevent respondents from entering a number larger than 100.
For a relationship, geo or roster question type, setting `max = 5` would prevent more than 5 responses from being entered for a question.

#### read_only
Indicates that a question cannot be answered. This would be used for questions which are serving as examples within the form.

#### exclusive
The exclusive parameter is used exclusively with multiple select question types and it is used to indicate that a certain choice will be an exclusive response. Examples include multiple select questions which have "none of the above" as an answer or "don't know". This can be used in combination with the "other" parameter. 

#### other
The other parameter indicates that a choice should also include a textbox for text entry when the choice is selected.

#### can_add_respondent
The can_add_respondent parameter controls whether or not an "other respondent" can be added from the context of a relationship type question.

#### allow_barcode
This parameter should be used with text, text area or roster question types to allow respondents to scan a barcode as an entry method. This is useful for lab samples, paper exams, or other barcode-encoded text to be entered using the mobile device's camera.

#### none
TODO: What does this do?

#### show_dk
This controls if the DK (Don't know) button is visible for a question. This is enabled by default.

#### show_rf
This controls if the RF (Refuse) button is visible for a question. This is enabled by default.

#### is_required
Questions are required by default, but questions can be made optional using this parameter.

#### geo_type
The geo_type parameter has different behavior depending on the question type. It is valid only for geo and respondent_geo question types. For the geo question type it can be

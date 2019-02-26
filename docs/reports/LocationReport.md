# Location report
The location report is a complete list of all of the locations in Trellis which are assigned to a study.


## Base fields
These fields will be present in every report.

| Column | Type | Description |
| --- | --- | --- |
| geo_id | UUID | The unique identifier for this location used throughout the database.
| latitude | number | The latitude for this location.
| longitude | number | The longitude for this location.
| altitude | number | A number representing the altitude of this location.
| type | text | The location type assigned to this location. 
| num_parents | number | The number of parents that this location has.

## Translation fields
There will be one field for each language assigned to the study which holds the translated location name for that language. 

| Column | Example | Type | Description |
| --- | --- | --- | --- |
| {language_name} | English, Spanish, etc. | text | The name of the language associated with the translation.

## Location type fields
It is assumed that there is a natural hierarchy to the location types. For example, there might be the following types: Country, State and City. The natural hierarchy of generality from most general to least general would be `Country > State > City`. It is assumed that each location has at most one of these types in it's hierarchy.

Take, for example, the **City** of "Boston" which would reside in the **State** of "Massachusetts" which resides in the **Country** of the "United State of America". In our report, each of these types will have their own "id" and "name" columns and "Boston", "Massachusetts" and "United State of America" would all be rows in the report.

Example:

| geo_id | English | type | ... | city_id | city_name | state_id | state_name | country_id | country_name
|---|---|---|---|---|---|---|---|---|---|
| 0 | United States of America | Country | ... |
| 1 | Massachusetts | State | ... | | | | | 0 | United States of America |
| 2 | Boston | City | ... | | | 1 | Massachusetts | 0 | United States of America |

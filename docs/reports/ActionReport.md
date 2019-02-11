# Action report
Trellis captures the user's actions throughout a survey in addition to the data being created. These interactions have timestamps associated with them so that it is possible to analyze a respondent's behavior throughout a survey. For example, these data may make it possible to infer which questions are taking respondents the most time and which questions are the most confusing.

### Example output

| id  | question_id  | created_at | deleted_at | payload | action_type| interview_id | section_follow_up_repetition | section_repetition | preload_action_id | follow_up_action_id | sort_order |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2153eddf-08ef-4b87-a13a-768a4ac16fe5 | | 2018-12-10 21:23:07 | | {"val":"","n":4} | next | 000b2443-fb9d-4898-9287-eed51d0e5fdd | 0 |0 | | | 0 |
| 96552587-54e3-4dc4-a663-9fc60469676b | | 2018-12-10 21:23:05 | | {"val":"","n":2} | next | 000b2443-fb9d-4898-9287-eed51d0e5fdd | 0 |0 | | | 0 |
| 9f24fbb0-3235-461c-8c44-677ae1061581 | c05b9be9-f3a7-4d02-8354-53c6b1d0c6f4 | 2018-12-10 21:23:06 | | {"choice_id":"5c8ba6ef-caa7-4c21-85d5-9726ed6fd0fb","val":"1","name":"1","n":3} | select-choice | 000b2443-fb9d-4898-9287-eed51d0e5fdd | 0 |0 | | | 0 |
| adfa8191-af80-433e-b005-f4d7d09d666e | cbc79a51-9479-46ab-a24a-39ca12fc1286 | 2018-12-10 21:23:04 | | {"choice_id":"25b5230e-0add-4da9-819a-12355b7132fa","val":"1","name":"1","n":1} | select-choice | 000b2443-fb9d-4898-9287-eed51d0e5fdd | 0 |0 | | | 0 |

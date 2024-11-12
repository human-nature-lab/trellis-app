# Conditions

Conditions are text identifiers (e.g. is_female, has_children, watches_tv) you can apply to a respondent or form based
on responses to questions. Applied conditions may be used to show or hide questions (see [Page skips](Pages.md)), show 
or hide forms, and filter respondent search results (respondent scope condition tags only).

## Condition assignment

To assign a condition: 
  1. Click the "Assign Condition" button inside the question at the point of the survey where you want to assign the 
     condition.
  2. Type a text identifier for the condition in the first text box. We suggest you avoid spaces and special characters
     (other than underscores "_") in order to make the condition tags easier to search.
  3. Select the scope for the condition (Respondent, Form, or Section) from the drop-down list. See the *Condition 
     scope* section below for more information about how the scope affects the lifetime of the condition.
  4. Type a function that determines whether the condition is assigned in the "if" textarea. See the *Condition logic*
     section below for more information on how to write this logic.


## Condition scope

- Respondent scope
  * A condition with respondent scope will apply to all forms administered to the same respondent.
- Form scope
  * A condition with form scope will only apply within the form in which the condition was assigned.
- Section scope
  * A condition with section scope only applies within the section in which the condition was assigned. This is useful
    when you want different conditions assigned for each iteration of a repeated or follow-up section.

## Condition logic

*Note: The interface for specifying the logic for assigning condition tags is advanced, a simplified interface for 
condition assignment is planned but not yet available.*

A condition is assigned based on the results of evaluating a JavaScript function. If the function returns `true`, the 
condition is assigned, otherwise, the condition is not assigned. Trellis provides the function with two arguments - 
The first is a JavaScript [object][1]
representing a map of data on the current page where the keys are the var_names of each question. The second argument is 
an API for accessing data from any part of the form, checking if condition tags have been assigned, and getting the 
current location within the form. In the examples below we name the arguments `vars` and `api`.

### API Parameter
To access data via the API parameter use `api.data.get(varName)` or 
`api.data.get(varName, sectionRepetition, followUpRepetition)` This method will return one of the following depending on 
the type of question being queried: a string, an array of strings or `null`. Calling this method for questions that have
been skipped or have not been responded to yet will result in `null` being returned. Multi-response question types (
multiple select, roster, respondent, etc.) will return an array of strings if the question has been answered. 
Single-response question types (multiple choice, text, integer, etc) will return a string if the question has been answered.

To check if a condition tag has been assigned in this form use `api.conditionTag.exists(conditionTagName)`. This will 
return `true` or `false` indicating whether or not the condition tag has been assigned.

To access the current location within the form use `api.state`. This is an [object][1] which looks like this:
```javascript
{
  section: 0,
  page: 0,
  sectionRepetition: 0,
  sectionFollowUpRepetition: 0
}
```

### Examples

The boilerplate function for condition assignment is:

```javascript
function (vars, api) {
  // Code that returns true or false
}
```

An example vars object passed to the function might be:

```javascript
{
  'q0100': '1', // Response 1 chosen for a multiple-choice question
  'q0200': ['a', 'f', 'g'], // Responses a, f, and g chosen for a multiple-select question 
}

```

A simple function, which always assigns the condition, always returns true:

```javascript
function (vars, api) {
  return true; 
}
```

If you want to assign a condition only if the respondent answered '1' to question q0100, you would use the following
function: 

```javascript
function (vars, api) {
  return vars['q0100'] == '1'; 
}
```

OR using the `api`

```javascript
function (vars, api) {
  return api.data.get('q0100') == '1'
}
```

To assign a condition for respondents who chose option 'a', or 'c' for the multiple-select question q0200, you 
would use the function:

```javascript
function (vars) { 
  return (vars['q0200'].indexOf('a') > -1 || vars['q0200'].indexOf('c') > -1);
}
```

OR using the `api`
                              
```javascript
function (vars, api) {
  var data = api.data.get('q0200')
  return data.indexOf('a') > -1 || data.indexOf('c') > -1
}
```


Deterministic randomization with 50% probability
```javascript
function (vars, api) {
  const roll = (api.rawData.get('q0200')[0].randomSortOrder / (Number.MAX_SAFE_INTEGER - 1)) // a number between 0.0 - 1.0
  const probability = 0.50
  return roll < probability
}
```


*Note: Condition assignment functions must be idempotent: given the same input, the function should always return the 
same results.*


[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object

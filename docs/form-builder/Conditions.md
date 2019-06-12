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
     section below for more information on how 


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
condition is assigned, otherwise, the condition is not assigned. Trellis provides the function with the form values as 
an argument, in our examples we name this argument `vars`. 

### Examples

The boilerplate function for condition assignment is:

```
  function (vars) {
    // Code that returns true or false
  }
```

An example vars object passed to the function might be:

```
  {
    'q0100': '1', // Response 1 chosen for a multiple-choice question
    'q0200': ['a', 'f', 'g'], // Responses a, f, and g chosen for a multiple-select question 
  }

```

A simple function, which always assigns the condition, always returns true:

```
  function (vars) {
    return true; 
  }
```

If you want to assign a condition only if the respondent answered '1' to question q0100, you would use the following
function: 

```
  function (vars) {
    return vars['q0100'] == '1'; 
  }
```

To assign a condition for respondents who chose option 'a', or 'c' for the multiple-select question q0200, you 
would use the function:

```
  function(vars) { 
    return (vars['q0200'].indexOf('a') > -1 || vars['q0200'].indexOf('c') > -1);
  }
```

*Note: Condition assignment functions must be idempotent: given the same input, the function should always return the 
same results.*


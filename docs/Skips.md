# Skips
Skip logic can be used to skip pages, sections or forms within Trellis. Skips are either simple 
logic using Hide/Show statements or are custom JavaScript functions that have full access to all of 
the data in a form. 

## Simple skips 
Simple skip logic consists of one or more Hide/Show statements that determine if something is hidden
or shown. This simple skip logic can be used for sections, pages and forms.

Simple skips use [condition tags] that are assigned by previous questions in the same form to show 
or hide a section, page or form. Skips can also use [respondent condition tags] that were assigned 
by previously completed forms or tags that are imported into Trellis.

Multiple skips are evaluated in order, until the first "positive" result is found. When a positive skip condition is found, it is either hidden or shown depending on whether the skip condition is a **Hide** or **Show** condition respectively.

### Simple skip examples
#### Ask a question based on the eye color of a respondent
1. Assign one or more condition tags signifying the eye color of a respondent. In this example we'll use <v-chip label small>brown_eyes</v-chip>, <v-chip label small>green_eyes</v-chip> and <v-chip label small>blue_eyes</v-chip>. These conditions can be [assigned via a question][condition tags], [importing respondent condition tags], or manually via the [respondent's page][respondent condition tags].
2. Add a skip to the page we want to show for people with green eyes.The logic is **Show** this page if **Any** of these condition tags are assigned: <v-chip label small>green_eyes</v-chip>.

#### Hide a page for pregnant people
1. Same as #1 above, but this time we'll assign <v-chip label small>resp_pregnant</v-chip>
2. Add a skip to the page we want to hide with the logic: **Hide** this page if **Any** of these conditions are assigned: <v-chip label small>resp_pregnant</v-chip>

#### Multiple skips
This is an example of multiple skip conditions. Let's take the following skip conditions and reason through a few scenarios with them.
1. **Hide** the page if **Any** of these conditions: <v-chip label small>resp_is_senior</v-chip>
2. **Show** the page if **Any** of these conditions: <v-chip label small>resp_consented</v-chip>


##### Scenario 1
A respondent only has this conditions assigned: <v-chip label small>resp_consented</v-chip>. Will the page show to that respondent? The answer is yes, because the first "positive" skip result is **2** which is a **Show** condition.

##### Scenario 2
Instead, let's say a respondent has these conditions: <v-chip label small>resp_is_senior</v-chip> and <v-chip label small>resp_consented</v-chip>. In this scenario, the page will be hidden, because the first "positive" skip result is **1** which is a **Hide** skip condition.

## Custom skips
Custom skips are JavaScript functions that can be used to show/hide pages and sections using more complex logic than simple skips. Custom skips are not available for form skips.

### Usage
To create a custom skip,
1. Add a skip row to a page or section via the options menu (<i class="icon mdi mdi-dots-vertical"></i>) for that page or section
2. Change the skip to a custom skip using the options menu (<i class="icon mdi mdi-arrow-left"></i>) next to the new skip.
3. Write your custom skip logic using the API below.

### API
A custom skip function looks like this:
```javascript
function showIf({ vars, tags, data, location, interview, followUpDatum, getEdge, getDatum }) {
  return true;  // true means show the page/section, false means hide the page/section
}
```

#### Arguments

| arg | type | description |
|-----|------|-------------|
| vars | object | Access to values for any variable in the Trellis form. Behaves identically **vars** argument in [condition assignment](./form-builder/Conditions.md). |
| tags | object | Access to the condition tags in Trellis. Check if a condition tag with name "tag_one" exists using `tags.tag_one` |
| data | {[key: string]: [VarDataWrapper](https://github.com/human-nature-lab/trellis-app/blob/main/src/components/interview/classes/SkipApi.ts#L125)} | Access to the raw Trellis objects in a form. |
| location | [InterviewLocation](https://github.com/human-nature-lab/trellis-app/blob/main/src/components/interview/services/InterviewAlligator.ts#L13) | The current location in the form. |
| interview | [InterviewManager](https://github.com/human-nature-lab/trellis-app/blob/main/src/components/interview/classes/InterviewManager.ts) | Access to the interview API for navigation and data access. |
| followUpDatum | [Datum](https://github.com/human-nature-lab/trellis-app/blob/main/src/entities/trellis/Datum.ts#L28) | The current follow up datum if the skip is in a follow up section |
| getEdge | (edgeId: string) => [Edge](https://github.com/human-nature-lab/trellis-app/blob/main/src/entities/trellis/Edge.ts) | Get an edge object by id. |
| getDatum | (datumId: string) => [Datum](https://github.com/human-nature-lab/trellis-app/blob/main/src/entities/trellis/Datum.ts#L28) | Get a datum object by id. |

[condition tags]: ./form-builder/Conditions.md
[respondent condition tags]: ./respondents/RespondentInfo.md#condition-tags
[importing respondent condition tags]: ./reports/Importing.md#respondent-condition-tags

### Custom skip examples

#### Show a page/section if respondent has green eyes

##### Using question data
```javascript
function showIf({ vars }) {
  return vars.eye_color === 'green';
}
```

##### Using an assigned condition tag
```javascript
function showIf({ tags }) {
  return tags.green_eyes; // tags are true if they exist and false if not
}
```

#### Skip a page/section 50% of the time
```javascript
function showIf({ data }) {
  const max = Number.MAX_SAFE_INTEGER - 1 // Maximum value of randomSortOrder
  const probability = 0.5
  return data.eye_color.firstDatum.randomSortOrder < probability * max
}
```
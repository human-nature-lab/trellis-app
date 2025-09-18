import { FormBuilder } from './FormBuilder'
export const randomizedPages = new FormBuilder().addSection({
  // label: 'Randomized Pages',
  randomizePages: true,
  pages: [
    {
      questions: [
        {
          id: 'last',
          label: 'Question 1',
          questionType: 'text',
          choices: [],
          parameters: [],
          assignConditionTags: [],
          varName: 'question1',
        },
      ],
    },
    {
      questions: [
        {
          id: 'first',
          label: 'Question 2',
          questionType: 'text',
          choices: [],
          parameters: [],
          assignConditionTags: [],
          varName: 'question2',
        },
      ],
    },
  ],
}).form

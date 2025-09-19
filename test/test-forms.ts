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

export const randomizedQuestions = new FormBuilder().addSection({
  pages: [
    {
      randomizeQuestions: true,
      questions: [
        {
          id: 'first',
          varName: 'q1',
          label: 'Question 2',
          questionType: 'text',
        },
        {
          id: 'second',
          varName: 'q2',
          label: 'Question 3',
          questionType: 'text',
        },
      ],
    },
  ],
}).form

import transformToPaths from './transformToPaths'

// Just used for static linking to documentation files
export default transformToPaths({
  device_installation: {
    android: 'Android',
    ios: 'IOS'
  },
  form_builder: {
    adding_questions: 'Adding-questions',
    introduction: 'Introduction',
    question_parameters: 'Question-parameters',
    question_types: 'Question-types',
    repeated_sections: 'Repeated-sections',
    skips: 'Skips'
  },
  getting_started: {
    introduction: 'Introduction',
    create_form: 'Create-form'
  },
  locations: {
    info: 'Geo-info',
    map: 'Map',
    search: 'Search'
  },
  respondents: {
    search: 'Search'
  },
  sync: {
    admin: 'Admin',
    introduction: 'Introduction'
  },
  users: {
    intro: 'Introduction'
  },
  sidebar: '_Sidebar',
  home: 'Home'
}, '.md')

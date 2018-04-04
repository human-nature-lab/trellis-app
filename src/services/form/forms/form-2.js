export default {
  'form': {
    'id': '03551748-f180-44fa-9d58-c6b720c095e9',
    'form_master_id': '03551748-f180-44fa-9d58-c6b720c095e9',
    'name_translation_id': 'fb1ad732-5712-485e-82bd-3e81c5de0bdf',
    'version': 1,
    'is_published': '1',
    'created_at': '2017-08-24 14:43:34',
    'updated_at': '2017-08-24 15:11:55',
    'deleted_at': null,
    'sections': [
      {
        'id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
        'name_translation_id': '68202c33-69ef-4608-bd7d-4695d9069097',
        'created_at': '2017-08-24 14:44:19',
        'updated_at': '2017-08-24 14:44:19',
        'deleted_at': null,
        'pivot': {
          'form_id': '03551748-f180-44fa-9d58-c6b720c095e9',
          'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
          'sort_order': 1,
          'is_repeatable': 0,
          'max_repetitions': 0,
          'repeat_prompt_translation_id': null,
          'created_at': '2017-08-24 14:44:19',
          'updated_at': '2017-08-24 14:44:19'
        },
        'question_groups': [
          {
            'id': 'f3898710-bbd8-4f64-a517-ee283ee76570',
            'created_at': '2017-08-24 14:44:19',
            'updated_at': '2017-08-24 14:44:19',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': 'f3898710-bbd8-4f64-a517-ee283ee76570',
              'question_group_order': 6,
              'created_at': '2017-08-24 14:44:19',
              'updated_at': '2017-08-24 14:44:19'
            },
            'questions': [
              {
                'id': 'ee62790e-0b7c-405f-845c-00d91665f833',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': '6bf60ae2-6cc3-4fa0-bfe4-2bb57f0113da',
                'question_group_id': 'f3898710-bbd8-4f64-a517-ee283ee76570',
                'sort_order': 1,
                'var_name': 'c0500',
                'created_at': '2017-08-24 14:44:19',
                'updated_at': '2017-08-24 14:44:19',
                'deleted_at': null,
                'choices': [
                  {
                    'id': '045f722b-6a74-4c04-921c-df7d84f07f15',
                    'choice_translation_id': '6d0cc862-fd1f-426b-8698-3c5a72170230',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'ee62790e-0b7c-405f-845c-00d91665f833',
                      'choice_id': '045f722b-6a74-4c04-921c-df7d84f07f15',
                      'sort_order': 1,
                      'id': '53c4b463-4ca6-402f-b72a-8a9022358695',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '6d0cc862-fd1f-426b-8698-3c5a72170230',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '00aea2c0-81c7-4f49-96c0-580a138854f6',
                          'translation_id': '6d0cc862-fd1f-426b-8698-3c5a72170230',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Sí',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'aff15352-0109-425d-a4fc-51b00b918068',
                          'translation_id': '6d0cc862-fd1f-426b-8698-3c5a72170230',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Yes',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'cf5bf4b6-b0a8-409b-90d1-7c987052be2b',
                    'choice_translation_id': '70897c5a-fcd7-4916-b001-2356d1770132',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'ee62790e-0b7c-405f-845c-00d91665f833',
                      'choice_id': 'cf5bf4b6-b0a8-409b-90d1-7c987052be2b',
                      'sort_order': 2,
                      'id': '7cee9251-a465-4948-98c0-aa6b3f104bfe',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '70897c5a-fcd7-4916-b001-2356d1770132',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '70fbac0a-0ffa-4ee8-9a7e-2255e61f3256',
                          'translation_id': '70897c5a-fcd7-4916-b001-2356d1770132',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'bf24e4f7-3f57-443b-8ad0-5791851d0e96',
                          'translation_id': '70897c5a-fcd7-4916-b001-2356d1770132',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': '6bf60ae2-6cc3-4fa0-bfe4-2bb57f0113da',
                  'created_at': '2017-08-24 14:44:19',
                  'updated_at': '2017-08-24 14:44:19',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': 'db9b2157-40ff-415c-9c5e-a1eade3e5b65',
                      'translation_id': '6bf60ae2-6cc3-4fa0-bfe4-2bb57f0113da',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Have you had diarrhea in the last 4 weeks?',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': 'f98db2c1-a524-4691-88bf-bdb79746960a',
                      'translation_id': '6bf60ae2-6cc3-4fa0-bfe4-2bb57f0113da',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': '¿Usted ha tenido diarrea en las últimas 4 semanas?',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': [
                  {
                    'id': 'cc41e760-bc89-472a-8add-1563f8288e60',
                    'condition_tag_id': 'eed0f7c9-d64d-4d59-aa9a-129acc3c0f71',
                    'logic': 'function(vars) { return vars["c0500"] == "1"; }',
                    'scope': 'form',
                    'created_at': '2017-12-07 16:47:05',
                    'updated_at': '2017-12-07 16:47:15',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'ee62790e-0b7c-405f-845c-00d91665f833',
                      'assign_condition_tag_id': 'cc41e760-bc89-472a-8add-1563f8288e60',
                      'created_at': '2017-12-07 16:47:05',
                      'updated_at': '2017-12-07 16:47:05'
                    },
                    'condition': {
                      'id': 'eed0f7c9-d64d-4d59-aa9a-129acc3c0f71',
                      'name': 'c0500_diarrhea',
                      'created_at': '2017-12-07 16:47:05',
                      'updated_at': '2017-12-07 16:47:05',
                      'deleted_at': null
                    }
                  }
                ]
              }
            ],
            'skips': []
          },
          {
            'id': '33117e8c-182e-4c17-aa73-21a8b0f5d5ad',
            'created_at': '2017-08-24 14:44:20',
            'updated_at': '2017-08-24 14:44:20',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '33117e8c-182e-4c17-aa73-21a8b0f5d5ad',
              'question_group_order': 10,
              'created_at': '2017-08-24 14:44:20',
              'updated_at': '2017-08-24 14:44:20'
            },
            'questions': [
              {
                'id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                'question_type_id': '0f76b96f-613a-4925-bacd-74db45368edb',
                'question_translation_id': '3b12fb95-4ca0-4f9d-8f90-e39da47ddd92',
                'question_group_id': '33117e8c-182e-4c17-aa73-21a8b0f5d5ad',
                'sort_order': 1,
                'var_name': 'c0900',
                'created_at': '2017-08-24 14:44:20',
                'updated_at': '2017-08-24 14:44:20',
                'deleted_at': null,
                'choices': [
                  {
                    'id': '0350ed16-83ff-43d0-850a-0d8f79f17147',
                    'choice_translation_id': 'ba2952a1-00f9-40d2-ae1b-ee1866720455',
                    'val': 'e',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': '0350ed16-83ff-43d0-850a-0d8f79f17147',
                      'sort_order': 5,
                      'id': '0e049ce9-feb3-461c-989e-5c72e28fef54',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'ba2952a1-00f9-40d2-ae1b-ee1866720455',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '5f831f18-db6a-4179-ba07-14325a117d67',
                          'translation_id': 'ba2952a1-00f9-40d2-ae1b-ee1866720455',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Home remedy/herbal medicine',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '63e72a93-5b6f-4db9-b17a-0c0681cdadb9',
                          'translation_id': 'ba2952a1-00f9-40d2-ae1b-ee1866720455',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Remedio casero/ medicina herbaria',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '94cc5b43-f2c2-4df6-8b80-3abda70f09cf',
                    'choice_translation_id': '8abf2e24-84d4-4f8e-897d-647c7a0a0ff1',
                    'val': 'g',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': '94cc5b43-f2c2-4df6-8b80-3abda70f09cf',
                      'sort_order': 7,
                      'id': '1ec3f5b8-fd9b-4c96-b770-36cb140e9d9f',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '8abf2e24-84d4-4f8e-897d-647c7a0a0ff1',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '5e58aae0-310b-4dc1-a018-4a185bc86e03',
                          'translation_id': '8abf2e24-84d4-4f8e-897d-647c7a0a0ff1',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Desparasitantes',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'f9f0f2eb-fef0-4f3b-87a1-84727bffa584',
                          'translation_id': '8abf2e24-84d4-4f8e-897d-647c7a0a0ff1',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'De-worming medicine',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '7540ed6c-1cdb-4d4e-84a7-7ed1f80d9fdc',
                    'choice_translation_id': 'f7bdd824-f9b8-4519-b12d-287250c306f8',
                    'val': 'm',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': '7540ed6c-1cdb-4d4e-84a7-7ed1f80d9fdc',
                      'sort_order': 13,
                      'id': '46b3c819-16dc-4877-8364-0e073a4bbd99',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'f7bdd824-f9b8-4519-b12d-287250c306f8',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': 'd45a5b2b-0ceb-409c-94ec-73a4e888e842',
                          'translation_id': 'f7bdd824-f9b8-4519-b12d-287250c306f8',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Beber líquidos extra',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'd8d84aa9-f36f-4297-8744-c0e63be28027',
                          'translation_id': 'f7bdd824-f9b8-4519-b12d-287250c306f8',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Taking extra liquids',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '65e19aad-39b4-46b9-b000-7691f372e058',
                    'choice_translation_id': '66941bcb-b557-40be-9d06-718a37f4fd91',
                    'val': 'i',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': '65e19aad-39b4-46b9-b000-7691f372e058',
                      'sort_order': 9,
                      'id': '47def640-e0e6-4229-9696-f8ad3d57d687',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '66941bcb-b557-40be-9d06-718a37f4fd91',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '228f49b6-9291-402b-8ea4-4de2406471bb',
                          'translation_id': '66941bcb-b557-40be-9d06-718a37f4fd91',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Massage',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'e4933015-a3b9-4439-9944-d5d42f6ebb36',
                          'translation_id': '66941bcb-b557-40be-9d06-718a37f4fd91',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Sobado/Masaje',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'd6d1d6f7-7b7b-4cd9-8ba4-676c081aaf08',
                    'choice_translation_id': '2c1bf970-7cbd-43e4-b82b-be267c05ed0a',
                    'val': 'd',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': 'd6d1d6f7-7b7b-4cd9-8ba4-676c081aaf08',
                      'sort_order': 4,
                      'id': '50c7b870-feca-478a-beb9-c6f33296ab02',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '2c1bf970-7cbd-43e4-b82b-be267c05ed0a',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '94d0c443-e5ee-4a30-b6c4-cc94e2f433a8',
                          'translation_id': '2c1bf970-7cbd-43e4-b82b-be267c05ed0a',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Anti-diarrhea medication',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'f28edac4-4393-4d1c-a4b9-9d5bf4f4e7a6',
                          'translation_id': '2c1bf970-7cbd-43e4-b82b-be267c05ed0a',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Medicamento anti diarreico en pastilla o jarabe',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '710e73e4-4cf4-4c8f-aeac-d4b5b564ecb5',
                    'choice_translation_id': 'bfaab3c4-229f-4fc6-9439-27402111a5d8',
                    'val': 'j',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': '710e73e4-4cf4-4c8f-aeac-d4b5b564ecb5',
                      'sort_order': 10,
                      'id': '810e62f5-3610-4007-81e9-9bdc3571c643',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'bfaab3c4-229f-4fc6-9439-27402111a5d8',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '4540e5b0-ead7-452f-88cb-21247d082890',
                          'translation_id': 'bfaab3c4-229f-4fc6-9439-27402111a5d8',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Dejar de comer',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '4ab51967-09c3-48a8-9794-581d1777a433',
                          'translation_id': 'bfaab3c4-229f-4fc6-9439-27402111a5d8',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Stop eating foods',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '4aed981b-8d20-4936-a9fe-c840ae5a559f',
                    'choice_translation_id': '53e5d263-3e3a-4b43-b476-497e8ef95f22',
                    'val': 'a',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': '4aed981b-8d20-4936-a9fe-c840ae5a559f',
                      'sort_order': 1,
                      'id': '845f45d2-d998-4489-841e-708e87c2d497',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '53e5d263-3e3a-4b43-b476-497e8ef95f22',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '4f3bd83b-3bba-42e2-9b05-27f966cb8d3d',
                          'translation_id': '53e5d263-3e3a-4b43-b476-497e8ef95f22',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'b61a87f4-d22a-4b11-a21f-288574bd9e1f',
                          'translation_id': '53e5d263-3e3a-4b43-b476-497e8ef95f22',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '58466890-6017-429d-aecc-45a1ad77aede',
                    'choice_translation_id': 'af8cba56-6b02-4fde-8052-1735c9e06cbf',
                    'val': 'c',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': '58466890-6017-429d-aecc-45a1ad77aede',
                      'sort_order': 3,
                      'id': '8eb36f91-626a-40ee-a6e2-2e3025f60f9e',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'af8cba56-6b02-4fde-8052-1735c9e06cbf',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '4d15e8d6-6bd3-4a34-b19a-f2e89084b176',
                          'translation_id': 'af8cba56-6b02-4fde-8052-1735c9e06cbf',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Zinc en pastilla o jarabe',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'c62ea99c-ad23-4b20-84fa-fc45625162f7',
                          'translation_id': 'af8cba56-6b02-4fde-8052-1735c9e06cbf',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Zinc (pill or syrup)',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'e36e01bb-0215-49f4-8aee-c7c0c570d6dc',
                    'choice_translation_id': 'be0e12ff-f9dc-42ee-bb37-2a22709b2dc5',
                    'val': 'l',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': 'e36e01bb-0215-49f4-8aee-c7c0c570d6dc',
                      'sort_order': 12,
                      'id': '90ca0a43-7a12-47a8-890c-8b43acfadbf5',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'be0e12ff-f9dc-42ee-bb37-2a22709b2dc5',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '957d5c31-49fc-4bc5-bfdb-12755cc398cf',
                          'translation_id': 'be0e12ff-f9dc-42ee-bb37-2a22709b2dc5',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Eating extra foods',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'c2585651-36e9-4201-ae68-6c260a951ba2',
                          'translation_id': 'be0e12ff-f9dc-42ee-bb37-2a22709b2dc5',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Comer comida extra',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '53a98872-a6c3-4c08-b115-519e656746af',
                    'choice_translation_id': '61d01153-96e0-4775-b60a-477cf9a1bd20',
                    'val': 'f',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': '53a98872-a6c3-4c08-b115-519e656746af',
                      'sort_order': 6,
                      'id': '9f732230-0a39-44d1-beef-05d7125559f1',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '61d01153-96e0-4775-b60a-477cf9a1bd20',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '76cdd377-4ab5-4309-87da-e6a5d85a9665',
                          'translation_id': '61d01153-96e0-4775-b60a-477cf9a1bd20',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Laxative',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'e6813482-3d15-447c-a5fe-51f6d661b9c6',
                          'translation_id': '61d01153-96e0-4775-b60a-477cf9a1bd20',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Laxantes',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'dbe45e3d-db7e-4493-b714-83842cfef5c1',
                    'choice_translation_id': '59101042-1d36-4d35-9e46-7ca9350c4ccd',
                    'val': 'b',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': 'dbe45e3d-db7e-4493-b714-83842cfef5c1',
                      'sort_order': 2,
                      'id': 'b2bee92c-39f6-4bbd-b8da-1f22a11fee5d',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '59101042-1d36-4d35-9e46-7ca9350c4ccd',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '318d4b50-041e-4996-89fe-5459cd258d5c',
                          'translation_id': '59101042-1d36-4d35-9e46-7ca9350c4ccd',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Antibiotic (pill or syrup)',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'd920a707-ab45-4d0f-a81e-fe59aaf95a34',
                          'translation_id': '59101042-1d36-4d35-9e46-7ca9350c4ccd',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Antibiótico en pastilla o jarabe',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '540d0cb4-3154-42ec-8afc-fd3eb42e9b01',
                    'choice_translation_id': '3d02b96f-c811-42f4-ba7f-6558aa63ab1d',
                    'val': 'k',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': '540d0cb4-3154-42ec-8afc-fd3eb42e9b01',
                      'sort_order': 11,
                      'id': 'bb2e4314-ca02-4050-8668-80fde04b77ad',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '3d02b96f-c811-42f4-ba7f-6558aa63ab1d',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': 'c43c84d6-ed94-4a19-a3ea-970163d13f5b',
                          'translation_id': '3d02b96f-c811-42f4-ba7f-6558aa63ab1d',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Stop taking liquids',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'eeebd466-6850-49e4-ad74-837dbb68f8a1',
                          'translation_id': '3d02b96f-c811-42f4-ba7f-6558aa63ab1d',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Dejar de beber líquidos',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '3810c49b-6679-4b1f-9574-ca6e805158ab',
                    'choice_translation_id': 'a5851d1c-392b-4cc5-8088-fb1448f850db',
                    'val': 'n',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': '3810c49b-6679-4b1f-9574-ca6e805158ab',
                      'sort_order': 14,
                      'id': 'cb1f724a-2f22-405c-87e4-949c488efb64',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'a5851d1c-392b-4cc5-8088-fb1448f850db',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '261d083a-2d6e-4039-b40e-9afd05dafabc',
                          'translation_id': 'a5851d1c-392b-4cc5-8088-fb1448f850db',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Otro',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'cc5414c6-bc1e-447e-9a75-9d529a0dd9f5',
                          'translation_id': 'a5851d1c-392b-4cc5-8088-fb1448f850db',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Other',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '41a8878d-ee95-47ac-b42a-e66f55dbdf42',
                    'choice_translation_id': '55c601f3-961f-46b5-ae6b-0619349c663c',
                    'val': 'h',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                      'choice_id': '41a8878d-ee95-47ac-b42a-e66f55dbdf42',
                      'sort_order': 8,
                      'id': 'fbd79b92-023d-4f41-a657-fe791c8b212f',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '55c601f3-961f-46b5-ae6b-0619349c663c',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '03345946-7aa7-4460-a379-f5655ae0d555',
                          'translation_id': '55c601f3-961f-46b5-ae6b-0619349c663c',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Chupon',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '55f89a58-8ac0-4f8b-a8ba-21287003a7fc',
                          'translation_id': '55c601f3-961f-46b5-ae6b-0619349c663c',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Chupon',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': '3b12fb95-4ca0-4f9d-8f90-e39da47ddd92',
                  'created_at': '2017-08-24 14:44:20',
                  'updated_at': '2017-08-24 14:44:20',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '701c140a-de78-44bf-a7a9-74c915e93dc2',
                      'translation_id': '3b12fb95-4ca0-4f9d-8f90-e39da47ddd92',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Did you take or do anything else to treat the diarrhea?...DO NOT READ RESPONSES \n \n RECORD ALL TREATMENTS GIVEN',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': '7f16593c-d5b9-4f05-89ab-bdfafe339cee',
                      'translation_id': '3b12fb95-4ca0-4f9d-8f90-e39da47ddd92',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': '¿Ha tomado o hecho algo más para tratar la diarrea? NO LEA LAS RESPUESTAS.\n \n MARCAR TODAS LAS RESPUESTAS MENCIONADAS.',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-11-20 16:05:45',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': '0f76b96f-613a-4925-bacd-74db45368edb',
                  'name': 'multiple_select',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [
                  {
                    'id': '0c3d9706-2b20-4153-adf3-35a934d42cb2',
                    'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                    'parameter_id': '16',
                    'val': 'a',
                    'created_at': '2018-02-14 20:23:33',
                    'updated_at': '2018-02-14 20:23:33',
                    'deleted_at': null,
                    'parameter': {
                      'id': '16',
                      'name': 'other_exclusive',
                      'created_at': '2017-08-07 20:12:53',
                      'updated_at': '2017-08-07 20:12:53',
                      'deleted_at': null
                    }
                  },
                  {
                    'id': '7b62cf09-72f7-4ad7-8c90-778b5b297cda',
                    'question_id': '7a0c865d-184f-456b-a745-dbbd76eef246',
                    'parameter_id': '3',
                    'val': 'n',
                    'created_at': '2017-10-30 19:46:19',
                    'updated_at': '2017-10-30 19:46:19',
                    'deleted_at': null,
                    'parameter': {
                      'id': '3',
                      'name': 'other',
                      'created_at': '2017-06-21 20:53:50',
                      'updated_at': '2017-06-21 20:53:50',
                      'deleted_at': null
                    }
                  }
                ],
                'assign_condition_tags': []
              }
            ],
            'skips': [
              {
                'id': '54a164cc-da82-4cd7-8d4a-db8c4fd167d9',
                'show_hide': '1',
                'any_all': '0',
                'precedence': 0,
                'created_at': '2017-08-24 14:53:47',
                'updated_at': '2017-12-07 16:51:48',
                'deleted_at': null,
                'pivot': {
                  'question_group_id': '33117e8c-182e-4c17-aa73-21a8b0f5d5ad',
                  'skip_id': '54a164cc-da82-4cd7-8d4a-db8c4fd167d9',
                  'created_at': '2017-08-24 14:53:47',
                  'updated_at': '2017-08-24 14:53:47'
                },
                'conditions': [
                  {
                    'id': '4ea36a46-4b7e-46b4-8445-0843e8061eb6',
                    'skip_id': '54a164cc-da82-4cd7-8d4a-db8c4fd167d9',
                    'created_at': '2017-12-07 16:51:43',
                    'updated_at': '2017-12-07 16:51:43',
                    'deleted_at': null,
                    'condition_tag_name': 'c0500_diarrhea'
                  }
                ]
              }
            ]
          },
          {
            'id': '492cab2f-7698-42f5-8350-48be20c9db78',
            'created_at': '2017-08-24 14:44:20',
            'updated_at': '2017-08-24 14:44:20',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '492cab2f-7698-42f5-8350-48be20c9db78',
              'question_group_order': 11,
              'created_at': '2017-08-24 14:44:20',
              'updated_at': '2017-08-24 14:44:20'
            },
            'questions': [
              {
                'id': 'a4b91e44-1ef1-40a0-9b1c-8953f8ae18c1',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': '1fb61446-9386-48a9-b476-9492c57f653e',
                'question_group_id': '492cab2f-7698-42f5-8350-48be20c9db78',
                'sort_order': 1,
                'var_name': 'c1000',
                'created_at': '2017-08-24 14:44:20',
                'updated_at': '2017-08-24 14:44:20',
                'deleted_at': null,
                'choices': [
                  {
                    'id': '9f65c8b6-a8be-41d4-ba6b-dd15c3c5b1a2',
                    'choice_translation_id': 'f23efc9f-8f39-4312-bf76-c0269e7ee98c',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'a4b91e44-1ef1-40a0-9b1c-8953f8ae18c1',
                      'choice_id': '9f65c8b6-a8be-41d4-ba6b-dd15c3c5b1a2',
                      'sort_order': 2,
                      'id': '3d257e19-eff3-4db4-aa69-fb684e9ed4b7',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'f23efc9f-8f39-4312-bf76-c0269e7ee98c',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': 'c78bb87a-4349-4fc2-885d-c4a66d0956d2',
                          'translation_id': 'f23efc9f-8f39-4312-bf76-c0269e7ee98c',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'e8f647d9-93d7-4398-9a00-aeef3b74e485',
                          'translation_id': 'f23efc9f-8f39-4312-bf76-c0269e7ee98c',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '465aa0e0-2502-407d-b038-a418f7b829d4',
                    'choice_translation_id': '8f7ee7bb-9922-4540-91aa-ef9c0a7a7abb',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'a4b91e44-1ef1-40a0-9b1c-8953f8ae18c1',
                      'choice_id': '465aa0e0-2502-407d-b038-a418f7b829d4',
                      'sort_order': 1,
                      'id': 'e1080755-07a0-4e4b-9d2f-237a6cd6e747',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '8f7ee7bb-9922-4540-91aa-ef9c0a7a7abb',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '1ea2f44c-4d6b-4927-8c51-a24ae97c3383',
                          'translation_id': '8f7ee7bb-9922-4540-91aa-ef9c0a7a7abb',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Sí',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '9812cf81-020c-4b3c-aa22-32b4987ef41e',
                          'translation_id': '8f7ee7bb-9922-4540-91aa-ef9c0a7a7abb',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Yes',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': '1fb61446-9386-48a9-b476-9492c57f653e',
                  'created_at': '2017-08-24 14:44:20',
                  'updated_at': '2017-08-24 14:44:20',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '1b351356-3389-4650-92fc-cc6d8ca472e7',
                      'translation_id': '1fb61446-9386-48a9-b476-9492c57f653e',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Have you been coughing for at least two weeks?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': '38016863-4f37-4b29-8ca6-63594c90b278',
                      'translation_id': '1fb61446-9386-48a9-b476-9492c57f653e',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Ha estado tosiendo usted por lo menos por dos semanas seguidas?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          },
          {
            'id': '0f1cab63-b2ea-4cf1-9f59-aa13c26a7716',
            'created_at': '2017-08-24 14:44:19',
            'updated_at': '2017-08-24 14:44:19',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '0f1cab63-b2ea-4cf1-9f59-aa13c26a7716',
              'question_group_order': 3,
              'created_at': '2017-08-24 14:44:19',
              'updated_at': '2017-08-24 14:44:19'
            },
            'questions': [
              {
                'id': '9990e422-5c64-4be4-971c-7ad7e71309a7',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': '5e512549-90c7-4678-9074-aa8873b1ec87',
                'question_group_id': '0f1cab63-b2ea-4cf1-9f59-aa13c26a7716',
                'sort_order': 1,
                'var_name': 'c0200',
                'created_at': '2017-08-24 14:44:19',
                'updated_at': '2017-08-24 14:44:19',
                'deleted_at': null,
                'choices': [
                  {
                    'id': '800d7816-a3a4-4548-93a7-dde2688cdb15',
                    'choice_translation_id': '0c338289-2e68-4f04-8c29-19d70d0546c5',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '9990e422-5c64-4be4-971c-7ad7e71309a7',
                      'choice_id': '800d7816-a3a4-4548-93a7-dde2688cdb15',
                      'sort_order': 1,
                      'id': '6235a431-8544-43dc-8179-ae1cd0bbdc6f',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': '0c338289-2e68-4f04-8c29-19d70d0546c5',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '0c09e4e3-3164-44b7-b800-6bd8232cd8bb',
                          'translation_id': '0c338289-2e68-4f04-8c29-19d70d0546c5',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'excellent',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '189b5ca0-bd9c-46cf-a3d2-4ab1e1e16daa',
                          'translation_id': '0c338289-2e68-4f04-8c29-19d70d0546c5',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Excelente',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '8f74be8a-8dd9-460e-bfe1-0195a432fd7b',
                    'choice_translation_id': 'df766b8f-7dc4-4d66-b282-ed8143cb88ea',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '9990e422-5c64-4be4-971c-7ad7e71309a7',
                      'choice_id': '8f74be8a-8dd9-460e-bfe1-0195a432fd7b',
                      'sort_order': 2,
                      'id': '672b5f86-5b8b-401a-95f7-cf2c849ad421',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': 'df766b8f-7dc4-4d66-b282-ed8143cb88ea',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '292d3744-de61-4720-b79b-9a3c6ca4a831',
                          'translation_id': 'df766b8f-7dc4-4d66-b282-ed8143cb88ea',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Muy buena',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'eb668c5f-a5da-43be-b911-23fc409e712c',
                          'translation_id': 'df766b8f-7dc4-4d66-b282-ed8143cb88ea',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'very good',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '904d0b15-6d38-42a1-9be2-5d74cf3713c1',
                    'choice_translation_id': 'd511aadd-3bed-4a5b-a933-5bf9e7af1776',
                    'val': '5',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '9990e422-5c64-4be4-971c-7ad7e71309a7',
                      'choice_id': '904d0b15-6d38-42a1-9be2-5d74cf3713c1',
                      'sort_order': 5,
                      'id': '749639fb-920b-47ef-8019-c1693e99d87e',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': 'd511aadd-3bed-4a5b-a933-5bf9e7af1776',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '18a66231-a789-4b94-b043-ed11b8b36e2b',
                          'translation_id': 'd511aadd-3bed-4a5b-a933-5bf9e7af1776',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'poor',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '3daf5dec-8578-4874-91fc-a87113f4f276',
                          'translation_id': 'd511aadd-3bed-4a5b-a933-5bf9e7af1776',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Mala',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'f2fd7fea-c18a-4471-9444-46b2c342a822',
                    'choice_translation_id': 'bd13cc62-7083-4ac5-a962-b0d641c6eada',
                    'val': '4',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '9990e422-5c64-4be4-971c-7ad7e71309a7',
                      'choice_id': 'f2fd7fea-c18a-4471-9444-46b2c342a822',
                      'sort_order': 4,
                      'id': '83288bd8-4ad8-448f-b5a6-6e3ebd362e22',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': 'bd13cc62-7083-4ac5-a962-b0d641c6eada',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': 'a644273a-fc26-4bd0-a3c7-e256e9e0d022',
                          'translation_id': 'bd13cc62-7083-4ac5-a962-b0d641c6eada',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Regular',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'b3d45ca3-da2a-4ffe-b372-500d82b4a1b6',
                          'translation_id': 'bd13cc62-7083-4ac5-a962-b0d641c6eada',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'fair',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '67ea260d-fc8a-416c-81f0-e5db98408f1e',
                    'choice_translation_id': '5bf654f1-f6ea-4426-a4eb-e76cbc9bf5a9',
                    'val': '3',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '9990e422-5c64-4be4-971c-7ad7e71309a7',
                      'choice_id': '67ea260d-fc8a-416c-81f0-e5db98408f1e',
                      'sort_order': 3,
                      'id': 'a51bbc27-7e35-4c7e-840a-5210c4602977',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': '5bf654f1-f6ea-4426-a4eb-e76cbc9bf5a9',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '059c46a5-78d0-42e5-9734-93cc81be2e95',
                          'translation_id': '5bf654f1-f6ea-4426-a4eb-e76cbc9bf5a9',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'good',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'a67df640-198e-440b-9fde-c7c61841465d',
                          'translation_id': '5bf654f1-f6ea-4426-a4eb-e76cbc9bf5a9',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Buena',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': '5e512549-90c7-4678-9074-aa8873b1ec87',
                  'created_at': '2017-08-24 14:44:19',
                  'updated_at': '2017-08-24 14:44:19',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '5cbdcb3f-3417-4730-a758-8317d1dad834',
                      'translation_id': '5e512549-90c7-4678-9074-aa8873b1ec87',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Now, thinking of your mental health, including stress, depression and emotional problems, how would you rate your overall mental health?',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': 'df117ffd-f205-4cbb-8949-028511e8e737',
                      'translation_id': '5e512549-90c7-4678-9074-aa8873b1ec87',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Ahora pensando en su salud mental, incluyendo cosas como el estrés (nervios), la depresión (tristeza) y problemas emocionales, ¿diría usted que en general, su salud mental es?',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          },
          {
            'id': '17920a1d-fe77-457e-b955-c00dfc702eaa',
            'created_at': '2017-08-24 14:44:19',
            'updated_at': '2017-08-24 14:44:19',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '17920a1d-fe77-457e-b955-c00dfc702eaa',
              'question_group_order': 2,
              'created_at': '2017-08-24 14:44:19',
              'updated_at': '2017-08-24 14:44:19'
            },
            'questions': [
              {
                'id': 'd486f2a5-fc90-495e-8425-ce8b2411f794',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': '5208e355-bf59-41a9-a3ef-e8889aff92dc',
                'question_group_id': '17920a1d-fe77-457e-b955-c00dfc702eaa',
                'sort_order': 1,
                'var_name': 'c0100',
                'created_at': '2017-08-24 14:44:19',
                'updated_at': '2017-08-24 14:44:19',
                'deleted_at': null,
                'choices': [
                  {
                    'id': '498b3075-d1aa-4243-b1b5-ed157c8d9c30',
                    'choice_translation_id': '403695fb-eb9b-40ea-8530-f7f080d561c2',
                    'val': '4',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'd486f2a5-fc90-495e-8425-ce8b2411f794',
                      'choice_id': '498b3075-d1aa-4243-b1b5-ed157c8d9c30',
                      'sort_order': 4,
                      'id': '4acb2583-38f7-48e8-a15b-b26ed365528b',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': '403695fb-eb9b-40ea-8530-f7f080d561c2',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '00ef2f6f-f2b3-4158-8fa9-99ec1a61caf7',
                          'translation_id': '403695fb-eb9b-40ea-8530-f7f080d561c2',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Regular',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'd3dba493-7736-4d5c-93e4-b8b08aa712ec',
                          'translation_id': '403695fb-eb9b-40ea-8530-f7f080d561c2',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'fair',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '28dcb2a0-e29a-4275-a3a9-d86a0e82a62f',
                    'choice_translation_id': '49fb866c-bff0-4c29-b6f7-8d42a786bf46',
                    'val': '3',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'd486f2a5-fc90-495e-8425-ce8b2411f794',
                      'choice_id': '28dcb2a0-e29a-4275-a3a9-d86a0e82a62f',
                      'sort_order': 3,
                      'id': '5b4e3b3e-d9b7-40ad-b1f2-48938598c615',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': '49fb866c-bff0-4c29-b6f7-8d42a786bf46',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '1cd16b33-aad3-46a5-9f71-369b31619a80',
                          'translation_id': '49fb866c-bff0-4c29-b6f7-8d42a786bf46',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Buena',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'f765fa84-bd2c-4304-9512-9f0efcdd42dd',
                          'translation_id': '49fb866c-bff0-4c29-b6f7-8d42a786bf46',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'good',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '068df388-adda-45a5-a3d9-2b55f7294259',
                    'choice_translation_id': '74d0dbeb-6ba4-45d3-a90c-d71ed377a7ce',
                    'val': '5',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'd486f2a5-fc90-495e-8425-ce8b2411f794',
                      'choice_id': '068df388-adda-45a5-a3d9-2b55f7294259',
                      'sort_order': 5,
                      'id': '60f5be52-1bf4-4811-ad98-585f2ce6ab20',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': '74d0dbeb-6ba4-45d3-a90c-d71ed377a7ce',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '68fe62fc-a91f-48e3-87f7-7b4fed022bc2',
                          'translation_id': '74d0dbeb-6ba4-45d3-a90c-d71ed377a7ce',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'poor',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '98cb9686-e032-4616-87b5-5d2b440677d8',
                          'translation_id': '74d0dbeb-6ba4-45d3-a90c-d71ed377a7ce',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Mala',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '186c8ed6-d8f7-4ad4-aae9-b33ed5e3cc3d',
                    'choice_translation_id': '77ab632d-c46f-4bd2-95a5-3ef34c9109ca',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'd486f2a5-fc90-495e-8425-ce8b2411f794',
                      'choice_id': '186c8ed6-d8f7-4ad4-aae9-b33ed5e3cc3d',
                      'sort_order': 2,
                      'id': '7709a7eb-66d6-4660-9fa3-1040feac373d',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': '77ab632d-c46f-4bd2-95a5-3ef34c9109ca',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '40263cf7-c4ad-41ee-bda0-c40a1feabe57',
                          'translation_id': '77ab632d-c46f-4bd2-95a5-3ef34c9109ca',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'very good',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'c244ca3c-8566-4470-8afe-209e665276db',
                          'translation_id': '77ab632d-c46f-4bd2-95a5-3ef34c9109ca',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Muy buena',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '674ac1f9-9914-48e1-8fed-1944275623bc',
                    'choice_translation_id': 'aa4d77e4-bb49-417e-ab58-c1b7ed602c69',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'd486f2a5-fc90-495e-8425-ce8b2411f794',
                      'choice_id': '674ac1f9-9914-48e1-8fed-1944275623bc',
                      'sort_order': 1,
                      'id': 'bc8d42ac-3b65-437c-8887-56650c6b1f4d',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': 'aa4d77e4-bb49-417e-ab58-c1b7ed602c69',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '0408a6b6-7ad9-4f20-bb59-932eccd8070a',
                          'translation_id': 'aa4d77e4-bb49-417e-ab58-c1b7ed602c69',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Excelente',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '67ad4dff-a0b4-4970-9a6a-468065a946dd',
                          'translation_id': 'aa4d77e4-bb49-417e-ab58-c1b7ed602c69',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'excellent',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': '5208e355-bf59-41a9-a3ef-e8889aff92dc',
                  'created_at': '2017-08-24 14:44:19',
                  'updated_at': '2017-08-24 14:44:19',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '87c3eb51-6c63-4b1a-b28e-32b230b4250c',
                      'translation_id': '5208e355-bf59-41a9-a3ef-e8889aff92dc',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'En general, diría usted que su salud es:',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': 'e4fbf491-d5c9-4b09-b6c5-c82f9217670f',
                      'translation_id': '5208e355-bf59-41a9-a3ef-e8889aff92dc',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Generally, you would say that your health is:',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          },
          {
            'id': '45f87301-4f86-4db6-a78a-eed54cf06dd7',
            'created_at': '2017-08-24 14:44:19',
            'updated_at': '2017-08-24 14:44:19',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '45f87301-4f86-4db6-a78a-eed54cf06dd7',
              'question_group_order': 7,
              'created_at': '2017-08-24 14:44:19',
              'updated_at': '2017-08-24 14:44:19'
            },
            'questions': [
              {
                'id': '6e59c991-56e5-44d9-ad72-84987e6e598f',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': 'c93c9b06-7264-4227-8225-f17c1ccc3cb9',
                'question_group_id': '45f87301-4f86-4db6-a78a-eed54cf06dd7',
                'sort_order': 1,
                'var_name': 'c0600',
                'created_at': '2017-08-24 14:44:19',
                'updated_at': '2017-08-24 14:44:19',
                'deleted_at': null,
                'choices': [
                  {
                    'id': '96b3dc48-4d63-42bb-a5c7-2970b43ed1ae',
                    'choice_translation_id': 'fbcbfdf8-58ee-4bb7-9c63-9ad525d541fe',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '6e59c991-56e5-44d9-ad72-84987e6e598f',
                      'choice_id': '96b3dc48-4d63-42bb-a5c7-2970b43ed1ae',
                      'sort_order': 2,
                      'id': '0c291d57-97aa-492b-9ac2-38d77eafd974',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'fbcbfdf8-58ee-4bb7-9c63-9ad525d541fe',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '05149fed-d0ea-4515-8f2e-afd08e9d163b',
                          'translation_id': 'fbcbfdf8-58ee-4bb7-9c63-9ad525d541fe',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'bb4e387b-5862-428a-a3cb-df60e8d6a485',
                          'translation_id': 'fbcbfdf8-58ee-4bb7-9c63-9ad525d541fe',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'd1a15d60-2e9d-4b6d-96df-8eaf6116ae47',
                    'choice_translation_id': '15b9ea81-c709-497e-a994-df8fa9eced5c',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '6e59c991-56e5-44d9-ad72-84987e6e598f',
                      'choice_id': 'd1a15d60-2e9d-4b6d-96df-8eaf6116ae47',
                      'sort_order': 1,
                      'id': '68c1b7a3-cc54-4cc3-a045-a490883aca9c',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '15b9ea81-c709-497e-a994-df8fa9eced5c',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': 'bbb9ddcd-3400-4587-9edc-fdcdea86df5c',
                          'translation_id': '15b9ea81-c709-497e-a994-df8fa9eced5c',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Sí',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'e85acf28-f284-4daa-abc4-f81b7a9978c7',
                          'translation_id': '15b9ea81-c709-497e-a994-df8fa9eced5c',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Yes',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': 'c93c9b06-7264-4227-8225-f17c1ccc3cb9',
                  'created_at': '2017-08-24 14:44:19',
                  'updated_at': '2017-08-24 14:44:19',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '775c93bc-2f04-42e3-8004-065efe056d66',
                      'translation_id': 'c93c9b06-7264-4227-8225-f17c1ccc3cb9',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': '¿Había sangre en las heces?',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': 'a1cba58f-794a-4170-97a8-32c9b9a0b06e',
                      'translation_id': 'c93c9b06-7264-4227-8225-f17c1ccc3cb9',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Was there any blood in the stools?',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': [
              {
                'id': 'a13ab730-4a76-4e59-932a-90cf26cbd231',
                'show_hide': '1',
                'any_all': '0',
                'precedence': 0,
                'created_at': '2017-08-24 14:49:56',
                'updated_at': '2017-12-07 16:47:26',
                'deleted_at': null,
                'pivot': {
                  'question_group_id': '45f87301-4f86-4db6-a78a-eed54cf06dd7',
                  'skip_id': 'a13ab730-4a76-4e59-932a-90cf26cbd231',
                  'created_at': '2017-08-24 14:49:56',
                  'updated_at': '2017-08-24 14:49:56'
                },
                'conditions': [
                  {
                    'id': 'cc3f0a68-4754-47b2-b71d-8c01eb2fcc61',
                    'skip_id': 'a13ab730-4a76-4e59-932a-90cf26cbd231',
                    'created_at': '2017-12-07 16:47:30',
                    'updated_at': '2017-12-07 16:47:30',
                    'deleted_at': null,
                    'condition_tag_name': 'c0500_diarrhea'
                  }
                ]
              }
            ]
          },
          {
            'id': '461dd30c-7bde-4a0a-9312-886a93a6b1cd',
            'created_at': '2017-08-24 14:44:20',
            'updated_at': '2017-08-24 14:44:20',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '461dd30c-7bde-4a0a-9312-886a93a6b1cd',
              'question_group_order': 9,
              'created_at': '2017-08-24 14:44:20',
              'updated_at': '2017-08-24 14:44:20'
            },
            'questions': [
              {
                'id': '112241ec-f409-401e-94ea-eb17d1ff2bd2',
                'question_type_id': '2d3ff07a-5ab1-4da0-aa7f-440cf8cd0980',
                'question_translation_id': '61cb204b-bc6c-41a1-bc85-eb56a55c2c40',
                'question_group_id': '461dd30c-7bde-4a0a-9312-886a93a6b1cd',
                'sort_order': 1,
                'var_name': 'c0800',
                'created_at': '2017-08-24 14:44:20',
                'updated_at': '2017-08-24 14:44:20',
                'deleted_at': null,
                'choices': [],
                'question_translation': {
                  'id': '61cb204b-bc6c-41a1-bc85-eb56a55c2c40',
                  'created_at': '2017-08-24 14:44:20',
                  'updated_at': '2017-08-24 14:44:20',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '5554f7e2-3c21-4cc0-88f2-01cc55fabe53',
                      'translation_id': '61cb204b-bc6c-41a1-bc85-eb56a55c2c40',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': '¿Por cuántos días tomo estos líquidos?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': '5564fd44-a20e-405e-962a-6f707e13e388',
                      'translation_id': '61cb204b-bc6c-41a1-bc85-eb56a55c2c40',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'For how many days did you take these liquids?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': '2d3ff07a-5ab1-4da0-aa7f-440cf8cd0980',
                  'name': 'integer',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': [
              {
                'id': '27fc16b8-38ef-49e0-895a-49583de1c00f',
                'show_hide': '1',
                'any_all': '0',
                'precedence': 0,
                'created_at': '2017-08-24 14:52:54',
                'updated_at': '2017-12-07 19:21:07',
                'deleted_at': null,
                'pivot': {
                  'question_group_id': '461dd30c-7bde-4a0a-9312-886a93a6b1cd',
                  'skip_id': '27fc16b8-38ef-49e0-895a-49583de1c00f',
                  'created_at': '2017-08-24 14:52:54',
                  'updated_at': '2017-08-24 14:52:54'
                },
                'conditions': [
                  {
                    'id': '328b5d46-678b-4dd8-b4db-8c69b11b8b5f',
                    'skip_id': '27fc16b8-38ef-49e0-895a-49583de1c00f',
                    'created_at': '2017-12-07 19:21:02',
                    'updated_at': '2017-12-07 19:21:02',
                    'deleted_at': null,
                    'condition_tag_name': 'c0700_liquids'
                  }
                ]
              }
            ]
          },
          {
            'id': '978fe7c3-4083-4847-b79d-4e1db67929a1',
            'created_at': '2017-08-24 14:44:19',
            'updated_at': '2017-08-24 14:44:19',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '978fe7c3-4083-4847-b79d-4e1db67929a1',
              'question_group_order': 8,
              'created_at': '2017-08-24 14:44:20',
              'updated_at': '2017-08-24 14:44:20'
            },
            'questions': [
              {
                'id': '9617eb3c-070a-4e29-b9da-abdf0cdd4d2d',
                'question_type_id': '0f76b96f-613a-4925-bacd-74db45368edb',
                'question_translation_id': '089e480a-998e-4c72-aa69-40bd563c9719',
                'question_group_id': '978fe7c3-4083-4847-b79d-4e1db67929a1',
                'sort_order': 1,
                'var_name': 'c0700',
                'created_at': '2017-08-24 14:44:20',
                'updated_at': '2017-08-24 14:44:20',
                'deleted_at': null,
                'choices': [
                  {
                    'id': '22b13457-0858-4230-bc03-d8906e5a1d4a',
                    'choice_translation_id': '98300720-dec7-4bbf-92d0-25e929c04d7a',
                    'val': 'a',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '9617eb3c-070a-4e29-b9da-abdf0cdd4d2d',
                      'choice_id': '22b13457-0858-4230-bc03-d8906e5a1d4a',
                      'sort_order': 1,
                      'id': '42dbb161-2e7e-49f2-a48f-249e7773f9a4',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '98300720-dec7-4bbf-92d0-25e929c04d7a',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '0a0496eb-e8a9-46ab-b991-61e4d8d5681a',
                          'translation_id': '98300720-dec7-4bbf-92d0-25e929c04d7a',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Un líquido preparado de un sobre especial llamado Sales de Rehidratación Oral o LITROSOL',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '9f27a45c-72cb-4fc0-b676-a63eebb1bee4',
                          'translation_id': '98300720-dec7-4bbf-92d0-25e929c04d7a',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'A fluid made from a special packet called ORS or LITROSOL',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '62d971aa-1a46-4013-8d83-548b41e6e777',
                    'choice_translation_id': 'fa26b02d-ee9d-4fa1-8913-261d67095374',
                    'val': 'b',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '9617eb3c-070a-4e29-b9da-abdf0cdd4d2d',
                      'choice_id': '62d971aa-1a46-4013-8d83-548b41e6e777',
                      'sort_order': 2,
                      'id': 'a9c1079c-ec83-4dac-a88f-7cbe9bc4baab',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'fa26b02d-ee9d-4fa1-8913-261d67095374',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '3ca3bd20-4f34-4f2d-b19d-923fe3928cd4',
                          'translation_id': 'fa26b02d-ee9d-4fa1-8913-261d67095374',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Un líquido preparado en casa recomendado por las autoridades de salud',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'a5e5eb80-19d7-4502-8d56-218de32e8f9f',
                          'translation_id': 'fa26b02d-ee9d-4fa1-8913-261d67095374',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'A government-recommended homemade fluid',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'c67265db-190a-4317-a393-3219a9935e5e',
                    'choice_translation_id': 'b6a06e0f-d1e0-47e8-a4e3-d76b8fb61d0c',
                    'val': 'c',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '9617eb3c-070a-4e29-b9da-abdf0cdd4d2d',
                      'choice_id': 'c67265db-190a-4317-a393-3219a9935e5e',
                      'sort_order': 3,
                      'id': 'dd808251-19fe-488f-91f5-e2129479dd19',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'b6a06e0f-d1e0-47e8-a4e3-d76b8fb61d0c',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '35bec513-70e7-4569-b5b6-01b30e585a1e',
                          'translation_id': 'b6a06e0f-d1e0-47e8-a4e3-d76b8fb61d0c',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Otros líquidos envasados o sueros comerciales (Pedialite, Oralite, Gatorade, etc.)',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'e5393d88-cb6d-4fb6-87d9-9f2b06b8b4f2',
                          'translation_id': 'b6a06e0f-d1e0-47e8-a4e3-d76b8fb61d0c',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Other bottled or commercial liquids (Pedialite, Oralite, Gatorade, etc.)',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'f52953ca-15e6-4c22-acec-2960cb02b047',
                    'choice_translation_id': '569b8fe5-59cd-4d49-a1af-11e9602d52b8',
                    'val': 'd',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '9617eb3c-070a-4e29-b9da-abdf0cdd4d2d',
                      'choice_id': 'f52953ca-15e6-4c22-acec-2960cb02b047',
                      'sort_order': 4,
                      'id': 'f6d4240f-9230-4ba7-8eab-bca4e4777849',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '569b8fe5-59cd-4d49-a1af-11e9602d52b8',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '0a1ef23a-773d-4f5a-8de3-a7f7ead79415',
                          'translation_id': '569b8fe5-59cd-4d49-a1af-11e9602d52b8',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'None',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '8d045b7b-61aa-40ed-bbd3-362b3e46474e',
                          'translation_id': '569b8fe5-59cd-4d49-a1af-11e9602d52b8',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Ninguno',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': '089e480a-998e-4c72-aa69-40bd563c9719',
                  'created_at': '2017-08-24 14:44:20',
                  'updated_at': '2017-08-24 14:44:20',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '7842c34a-1242-45db-a4a5-7150b3694018',
                      'translation_id': '089e480a-998e-4c72-aa69-40bd563c9719',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': '¿Ha bebido usted cualquiera de los siguientes líquidos en cualquier momento desde que le empezó la diarrea?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': 'e9db877f-97f8-49a7-9684-03a3252e84de',
                      'translation_id': '089e480a-998e-4c72-aa69-40bd563c9719',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Have you had any of the following liquids to drink at any time since you started having the diarrhea?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': '0f76b96f-613a-4925-bacd-74db45368edb',
                  'name': 'multiple_select',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [
                  {
                    'id': 'c63d53d6-c8a1-47e7-babf-b125edd0d889',
                    'question_id': '9617eb3c-070a-4e29-b9da-abdf0cdd4d2d',
                    'parameter_id': '16',
                    'val': 'd',
                    'created_at': '2017-10-30 19:54:42',
                    'updated_at': '2017-10-30 19:54:42',
                    'deleted_at': null,
                    'parameter': {
                      'id': '16',
                      'name': 'other_exclusive',
                      'created_at': '2017-08-07 20:12:53',
                      'updated_at': '2017-08-07 20:12:53',
                      'deleted_at': null
                    }
                  }
                ],
                'assign_condition_tags': [
                  {
                    'id': '8312d967-5732-4c11-ac73-8580ddc9f5a8',
                    'condition_tag_id': '9a6692d7-0dd5-4a3d-a492-4be1eadaf860',
                    'logic': 'function(vars) { return (vars.c0700.indexOf("a") > -1 || vars.c0700.indexOf("b") > -1 || vars.c0700.indexOf("c") > -1);\n}',
                    'scope': 'form',
                    'created_at': '2017-12-07 19:20:18',
                    'updated_at': '2018-01-12 15:45:03',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '9617eb3c-070a-4e29-b9da-abdf0cdd4d2d',
                      'assign_condition_tag_id': '8312d967-5732-4c11-ac73-8580ddc9f5a8',
                      'created_at': '2017-12-07 19:20:18',
                      'updated_at': '2017-12-07 19:20:18'
                    },
                    'condition': {
                      'id': '9a6692d7-0dd5-4a3d-a492-4be1eadaf860',
                      'name': 'c0700_liquids',
                      'created_at': '2017-12-07 19:20:18',
                      'updated_at': '2017-12-07 19:20:18',
                      'deleted_at': null
                    }
                  }
                ]
              }
            ],
            'skips': [
              {
                'id': 'fca8be62-691a-43b5-8f46-048f5fc7d60e',
                'show_hide': '1',
                'any_all': '0',
                'precedence': 0,
                'created_at': '2017-08-24 14:52:31',
                'updated_at': '2017-12-07 16:48:19',
                'deleted_at': null,
                'pivot': {
                  'question_group_id': '978fe7c3-4083-4847-b79d-4e1db67929a1',
                  'skip_id': 'fca8be62-691a-43b5-8f46-048f5fc7d60e',
                  'created_at': '2017-08-24 14:52:31',
                  'updated_at': '2017-08-24 14:52:31'
                },
                'conditions': [
                  {
                    'id': 'f77be4cd-1f2f-42d0-9466-69ecb1f79ce5',
                    'skip_id': 'fca8be62-691a-43b5-8f46-048f5fc7d60e',
                    'created_at': '2017-12-07 16:48:16',
                    'updated_at': '2017-12-07 16:48:16',
                    'deleted_at': null,
                    'condition_tag_name': 'c0500_diarrhea'
                  }
                ]
              }
            ]
          },
          {
            'id': '412056cd-2cc6-4206-b184-943a6c7fca57',
            'created_at': '2017-08-24 14:44:20',
            'updated_at': '2017-08-24 14:44:20',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '412056cd-2cc6-4206-b184-943a6c7fca57',
              'question_group_order': 15,
              'created_at': '2017-08-24 14:44:20',
              'updated_at': '2017-08-24 14:44:20'
            },
            'questions': [
              {
                'id': 'e4c06ada-73e0-44e4-83ec-917e9daa7c79',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': '6eff79ce-8add-4df4-aad0-af1aaba13daf',
                'question_group_id': '412056cd-2cc6-4206-b184-943a6c7fca57',
                'sort_order': 1,
                'var_name': 'd0100',
                'created_at': '2017-08-24 14:44:20',
                'updated_at': '2017-08-24 14:44:20',
                'deleted_at': null,
                'choices': [
                  {
                    'id': '8534dcce-46b0-47bb-a9d9-279cff006c33',
                    'choice_translation_id': 'd7add751-a210-4895-aa53-a625b531f9a8',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'e4c06ada-73e0-44e4-83ec-917e9daa7c79',
                      'choice_id': '8534dcce-46b0-47bb-a9d9-279cff006c33',
                      'sort_order': 2,
                      'id': '7c681a76-9d13-4e1e-9a9e-93898969acf1',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'd7add751-a210-4895-aa53-a625b531f9a8',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '37b18c28-7782-4368-96fd-275dc11c59d1',
                          'translation_id': 'd7add751-a210-4895-aa53-a625b531f9a8',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'e45029d1-cae5-465c-a315-2bec753ba3a9',
                          'translation_id': 'd7add751-a210-4895-aa53-a625b531f9a8',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'e88bb568-bda3-415f-8687-332d57552406',
                    'choice_translation_id': 'e2cdff61-cddc-4574-a86e-8b1db29ad2a6',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'e4c06ada-73e0-44e4-83ec-917e9daa7c79',
                      'choice_id': 'e88bb568-bda3-415f-8687-332d57552406',
                      'sort_order': 1,
                      'id': 'd4a05e66-7fe1-46e4-add4-4c62ea6188ac',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'e2cdff61-cddc-4574-a86e-8b1db29ad2a6',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '725fbc99-1261-4c67-b79f-75941b08eed1',
                          'translation_id': 'e2cdff61-cddc-4574-a86e-8b1db29ad2a6',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Sí',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '7afbb96e-733b-4754-b2d0-80ff6f74d163',
                          'translation_id': 'e2cdff61-cddc-4574-a86e-8b1db29ad2a6',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Yes',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': '6eff79ce-8add-4df4-aad0-af1aaba13daf',
                  'created_at': '2017-08-24 14:44:20',
                  'updated_at': '2017-08-24 14:44:20',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '7a63255d-993b-4ac2-a935-682038c5435d',
                      'translation_id': '6eff79ce-8add-4df4-aad0-af1aaba13daf',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'En los últimos 3 meses, por falta de dinero u otros recursos, alguna vez se preocupó de que se le acabara la comida en su hogar?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': 'd45a1cd1-213f-4da0-be6c-b4d6601dbd32',
                      'translation_id': '6eff79ce-8add-4df4-aad0-af1aaba13daf',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'In the past 3 months, for lack of money or other resources, did you ever worry that your household would run out of food?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          },
          {
            'id': '8bca77ba-ad36-4b19-a93a-1d31b05fd5ee',
            'created_at': '2017-08-24 14:44:20',
            'updated_at': '2017-08-24 14:44:20',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '8bca77ba-ad36-4b19-a93a-1d31b05fd5ee',
              'question_group_order': 14,
              'created_at': '2017-08-24 14:44:20',
              'updated_at': '2017-08-24 14:44:20'
            },
            'questions': [
              {
                'id': '5bd35938-0816-4a57-a01f-6b826855fb2f',
                'question_type_id': 'cebe05f8-8e17-4c5c-a5fa-abc3a9c6c1f9',
                'question_translation_id': 'ea4e22e4-95f0-46c6-add3-707df07b5168',
                'question_group_id': '8bca77ba-ad36-4b19-a93a-1d31b05fd5ee',
                'sort_order': 1,
                'var_name': 'd8888',
                'created_at': '2017-08-24 14:44:20',
                'updated_at': '2017-08-24 14:44:20',
                'deleted_at': null,
                'choices': [],
                'question_translation': {
                  'id': 'ea4e22e4-95f0-46c6-add3-707df07b5168',
                  'created_at': '2017-08-24 14:44:20',
                  'updated_at': '2017-08-24 14:44:20',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '8eb1ae5f-e168-439a-b660-979d34cd574f',
                      'translation_id': 'ea4e22e4-95f0-46c6-add3-707df07b5168',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Ahora le haremos algunas preguntas sobre sus recursos financieros',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': 'c3eed5f7-1f78-45a3-856d-e1e806cc474a',
                      'translation_id': 'ea4e22e4-95f0-46c6-add3-707df07b5168',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Now we will you ask you a few questions about your financial resources',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'cebe05f8-8e17-4c5c-a5fa-abc3a9c6c1f9',
                  'name': 'intro',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          },
          {
            'id': '86358ac0-3c92-468c-a216-d5672864a307',
            'created_at': '2017-08-24 14:44:20',
            'updated_at': '2017-08-24 14:44:20',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '86358ac0-3c92-468c-a216-d5672864a307',
              'question_group_order': 16,
              'created_at': '2017-08-24 14:44:20',
              'updated_at': '2017-08-24 14:44:20'
            },
            'questions': [
              {
                'id': 'aa34e740-249a-4791-92eb-518070a8a65d',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': '0dca03dd-5bd5-43c2-a9df-2c5aaf439988',
                'question_group_id': '86358ac0-3c92-468c-a216-d5672864a307',
                'sort_order': 1,
                'var_name': 'd0200',
                'created_at': '2017-08-24 14:44:20',
                'updated_at': '2017-08-24 14:44:20',
                'deleted_at': null,
                'choices': [
                  {
                    'id': 'e1196668-c338-403d-9eae-efc8efea8c3d',
                    'choice_translation_id': '51285109-2b6d-473b-a860-39da981016df',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'aa34e740-249a-4791-92eb-518070a8a65d',
                      'choice_id': 'e1196668-c338-403d-9eae-efc8efea8c3d',
                      'sort_order': 2,
                      'id': 'a12c39f1-9287-4627-a76b-8daa797e1e47',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '51285109-2b6d-473b-a860-39da981016df',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '14bcfe6b-4ca1-4b92-9170-94e25255dc47',
                          'translation_id': '51285109-2b6d-473b-a860-39da981016df',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '2fe0e7af-951f-4a35-852a-0cfe36087312',
                          'translation_id': '51285109-2b6d-473b-a860-39da981016df',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '4c3ce3de-f2e7-43e7-818f-01f95f659223',
                    'choice_translation_id': 'b2e6fe0e-8c64-4262-812a-0b4e2edde908',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'aa34e740-249a-4791-92eb-518070a8a65d',
                      'choice_id': '4c3ce3de-f2e7-43e7-818f-01f95f659223',
                      'sort_order': 1,
                      'id': 'b46ac434-9454-43a3-9b90-77af897e69b1',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'b2e6fe0e-8c64-4262-812a-0b4e2edde908',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '83284e19-5f13-4b34-9888-23a9337af649',
                          'translation_id': 'b2e6fe0e-8c64-4262-812a-0b4e2edde908',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Yes',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'ca5546a9-a51d-4909-b9d2-51737a079e9a',
                          'translation_id': 'b2e6fe0e-8c64-4262-812a-0b4e2edde908',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Sí',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': '0dca03dd-5bd5-43c2-a9df-2c5aaf439988',
                  'created_at': '2017-08-24 14:44:20',
                  'updated_at': '2017-08-24 14:44:20',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '8101ebee-38f6-4673-9719-d025c234cffa',
                      'translation_id': '0dca03dd-5bd5-43c2-a9df-2c5aaf439988',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'En los últimos 3 meses, por falta de dinero u otros recursos, alguna vez se quedaron sin comida en su hogar?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': 'cc09eb91-ab3e-4e6a-bd0a-2cd6b6d2c866',
                      'translation_id': '0dca03dd-5bd5-43c2-a9df-2c5aaf439988',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'In the past 3 months, for lack of money or other resources, did your household ever run out of food?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          },
          {
            'id': '21ba3adb-d1cc-42f0-811c-dbed2cf5b2ca',
            'created_at': '2017-08-24 14:44:20',
            'updated_at': '2017-08-24 14:44:20',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '21ba3adb-d1cc-42f0-811c-dbed2cf5b2ca',
              'question_group_order': 12,
              'created_at': '2017-08-24 14:44:20',
              'updated_at': '2017-08-24 14:44:20'
            },
            'questions': [
              {
                'id': 'c89357c7-71de-46db-afd5-5469a3fbe251',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': '2e5518a4-01a9-49f1-910d-7aef0bf0dbcd',
                'question_group_id': '21ba3adb-d1cc-42f0-811c-dbed2cf5b2ca',
                'sort_order': 1,
                'var_name': 'c1600',
                'created_at': '2017-08-24 14:44:20',
                'updated_at': '2017-08-24 14:44:20',
                'deleted_at': null,
                'choices': [
                  {
                    'id': '45a06c89-80fc-40b3-8ee1-fcfc7426071c',
                    'choice_translation_id': '7f0fd504-e27c-4bbe-917c-890150c68af1',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'c89357c7-71de-46db-afd5-5469a3fbe251',
                      'choice_id': '45a06c89-80fc-40b3-8ee1-fcfc7426071c',
                      'sort_order': 2,
                      'id': '46869049-7946-46ab-a4f6-9284bf61c06f',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '7f0fd504-e27c-4bbe-917c-890150c68af1',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '5d48a742-5c5d-4c93-9184-db74da63bcde',
                          'translation_id': '7f0fd504-e27c-4bbe-917c-890150c68af1',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'A little unsafe',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'd68e16f6-6e02-4a5d-9202-3f42daf63b92',
                          'translation_id': '7f0fd504-e27c-4bbe-917c-890150c68af1',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Un poco inseguro',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'aa6c4dfd-6985-4a15-a545-52b2423a9140',
                    'choice_translation_id': '7f10e812-3830-41ec-9cd6-e91859813e5b',
                    'val': '3',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'c89357c7-71de-46db-afd5-5469a3fbe251',
                      'choice_id': 'aa6c4dfd-6985-4a15-a545-52b2423a9140',
                      'sort_order': 3,
                      'id': '95c5bdd2-7266-46da-8d07-625dbd1a251b',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '7f10e812-3830-41ec-9cd6-e91859813e5b',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '6f421dfc-81fc-4762-b5f4-5eb0b2771ae4',
                          'translation_id': '7f10e812-3830-41ec-9cd6-e91859813e5b',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Inseguro',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'b7a14d62-ec39-4892-b1f1-0815727a7e0d',
                          'translation_id': '7f10e812-3830-41ec-9cd6-e91859813e5b',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Unsafe',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '9eed60ee-980a-4bfc-a6e8-b2b092dc2cde',
                    'choice_translation_id': 'a2f537d9-e900-4628-8729-8734ffefb61f',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'c89357c7-71de-46db-afd5-5469a3fbe251',
                      'choice_id': '9eed60ee-980a-4bfc-a6e8-b2b092dc2cde',
                      'sort_order': 1,
                      'id': 'aaf02382-e9cd-45c9-8538-ebcd1e302f02',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'a2f537d9-e900-4628-8729-8734ffefb61f',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': 'b445081a-b5b9-4fa7-8932-8fced96e15f8',
                          'translation_id': 'a2f537d9-e900-4628-8729-8734ffefb61f',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Safe',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'dbe29416-2fd8-4b8b-bcf0-eb63cdd2c4ee',
                          'translation_id': 'a2f537d9-e900-4628-8729-8734ffefb61f',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Seguro',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': '2e5518a4-01a9-49f1-910d-7aef0bf0dbcd',
                  'created_at': '2017-08-24 14:44:20',
                  'updated_at': '2017-08-24 14:44:20',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '6433cc40-3b03-44e7-82f7-562a14965d20',
                      'translation_id': '2e5518a4-01a9-49f1-910d-7aef0bf0dbcd',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': '¿Que tan seguro/a se siente usted caminando solo/a por su aldea durante el día?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-11-16 16:54:34',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': '71eb65d5-f628-4945-9843-ed1db441713f',
                      'translation_id': '2e5518a4-01a9-49f1-910d-7aef0bf0dbcd',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'How safe do you feel walking alone in your village during the day?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-11-30 21:03:25',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          },
          {
            'id': '57f8204f-e6e7-4540-91ce-249cae3043b7',
            'created_at': '2017-08-24 14:44:20',
            'updated_at': '2017-08-24 14:44:20',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '57f8204f-e6e7-4540-91ce-249cae3043b7',
              'question_group_order': 13,
              'created_at': '2017-08-24 14:44:20',
              'updated_at': '2017-08-24 14:44:20'
            },
            'questions': [
              {
                'id': 'e17321f6-3380-47c1-bb9a-24b588e451ba',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': '3067c4f5-ed80-4330-870a-36294f1aa457',
                'question_group_id': '57f8204f-e6e7-4540-91ce-249cae3043b7',
                'sort_order': 1,
                'var_name': 'c1700',
                'created_at': '2017-08-24 14:44:20',
                'updated_at': '2017-08-24 14:44:20',
                'deleted_at': null,
                'choices': [
                  {
                    'id': '685e7e15-d9c9-4ce3-bb83-31c13721fcbc',
                    'choice_translation_id': 'd465431f-6ea4-473c-b0c9-72f64ca4b895',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'e17321f6-3380-47c1-bb9a-24b588e451ba',
                      'choice_id': '685e7e15-d9c9-4ce3-bb83-31c13721fcbc',
                      'sort_order': 1,
                      'id': '03ad6e45-85c2-4e73-a4e9-f0820a61e85b',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'd465431f-6ea4-473c-b0c9-72f64ca4b895',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '4edbd4cd-8c2c-436b-9c35-6fcd3dfad907',
                          'translation_id': 'd465431f-6ea4-473c-b0c9-72f64ca4b895',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Seguro',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'eea8d809-f1b9-435b-86f3-0960f33c56fe',
                          'translation_id': 'd465431f-6ea4-473c-b0c9-72f64ca4b895',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Safe',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'b6961891-fb28-4729-82c1-73c74cf97b64',
                    'choice_translation_id': '64e14bd2-80f2-4394-8522-7e0ab8600d8f',
                    'val': '3',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'e17321f6-3380-47c1-bb9a-24b588e451ba',
                      'choice_id': 'b6961891-fb28-4729-82c1-73c74cf97b64',
                      'sort_order': 3,
                      'id': '94ec9c11-4516-4f1c-9f0d-6e1096828b9f',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '64e14bd2-80f2-4394-8522-7e0ab8600d8f',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '58e4783e-9f23-4198-8231-481867330a47',
                          'translation_id': '64e14bd2-80f2-4394-8522-7e0ab8600d8f',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Unsafe',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'e39ef51f-b714-48a5-ad68-c46e02f8521c',
                          'translation_id': '64e14bd2-80f2-4394-8522-7e0ab8600d8f',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Inseguro',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'e5dc4d2c-9ce7-4874-9a31-b499e99f24f0',
                    'choice_translation_id': '995ee0ca-d483-49ed-89f8-09df9e80a9a5',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'e17321f6-3380-47c1-bb9a-24b588e451ba',
                      'choice_id': 'e5dc4d2c-9ce7-4874-9a31-b499e99f24f0',
                      'sort_order': 2,
                      'id': 'db16f17e-1797-4843-84dd-0fae873891c0',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '995ee0ca-d483-49ed-89f8-09df9e80a9a5',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '20250e14-14af-49d0-ac4f-66cd8cb0c1ba',
                          'translation_id': '995ee0ca-d483-49ed-89f8-09df9e80a9a5',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Un poco inseguro',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '20da144c-3107-4283-a6dd-e53858efc195',
                          'translation_id': '995ee0ca-d483-49ed-89f8-09df9e80a9a5',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'A little unsafe',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': '3067c4f5-ed80-4330-870a-36294f1aa457',
                  'created_at': '2017-08-24 14:44:20',
                  'updated_at': '2017-08-24 14:44:20',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '2dc1e3bd-8e04-4b3d-bcdc-b580dd00863e',
                      'translation_id': '3067c4f5-ed80-4330-870a-36294f1aa457',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': '¿Que tan seguro/a se siente caminando solo/a en su aldea durante la noche?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': '2fe348ad-c4bc-4a40-a36a-ddac01e8fd87',
                      'translation_id': '3067c4f5-ed80-4330-870a-36294f1aa457',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'How safe do you feel walking alone in your village at night?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          },
          {
            'id': '8c1c250c-5e77-42b7-b344-c03c18015e4e',
            'created_at': '2017-08-24 14:44:19',
            'updated_at': '2017-08-24 14:44:19',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '8c1c250c-5e77-42b7-b344-c03c18015e4e',
              'question_group_order': 1,
              'created_at': '2017-08-24 14:44:19',
              'updated_at': '2017-08-24 14:44:19'
            },
            'questions': [
              {
                'id': '0ecbe530-f1c8-4d91-9206-b57a8f7b1a36',
                'question_type_id': 'cebe05f8-8e17-4c5c-a5fa-abc3a9c6c1f9',
                'question_translation_id': '4f746f42-b253-41a0-ab80-9229dbf1ae6d',
                'question_group_id': '8c1c250c-5e77-42b7-b344-c03c18015e4e',
                'sort_order': 1,
                'var_name': 'c8888',
                'created_at': '2017-08-24 14:44:19',
                'updated_at': '2017-08-24 14:44:19',
                'deleted_at': null,
                'choices': [],
                'question_translation': {
                  'id': '4f746f42-b253-41a0-ab80-9229dbf1ae6d',
                  'created_at': '2017-08-24 14:44:19',
                  'updated_at': '2017-08-24 14:44:19',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '2d2390f5-4a07-4dc3-9800-25d163e096ca',
                      'translation_id': '4f746f42-b253-41a0-ab80-9229dbf1ae6d',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Ahora, le haremos unas preguntas sobre usted mismo/a. Comenzaremos preguntando por su salud en general. ¿Tiene alguna pregunta antes de comenzar esta sección?',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': 'e942560e-77ef-4cc4-9d91-aa8b0d266d6a',
                      'translation_id': '4f746f42-b253-41a0-ab80-9229dbf1ae6d',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Now, we will ask you some questions about yourself. We will begin by asking about your health in general. Do you have any questions before we begin this section?',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'cebe05f8-8e17-4c5c-a5fa-abc3a9c6c1f9',
                  'name': 'intro',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          },
          {
            'id': '74c0fe4c-a241-434c-b789-691a954e5a45',
            'created_at': '2017-08-24 14:44:19',
            'updated_at': '2017-08-24 14:44:19',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '74c0fe4c-a241-434c-b789-691a954e5a45',
              'question_group_order': 5,
              'created_at': '2017-08-24 14:44:19',
              'updated_at': '2017-08-24 14:44:19'
            },
            'questions': [
              {
                'id': '50f62a9f-8c67-40e1-aebd-cc7ede2b6e0a',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': 'f6010777-11be-4d70-b868-456bc2d15615',
                'question_group_id': '74c0fe4c-a241-434c-b789-691a954e5a45',
                'sort_order': 1,
                'var_name': 'c0400',
                'created_at': '2017-08-24 14:44:19',
                'updated_at': '2017-08-24 14:44:19',
                'deleted_at': null,
                'choices': [
                  {
                    'id': 'dc546a28-b1e5-4bda-8671-d6cc2cbc4605',
                    'choice_translation_id': '3221dfd4-cce0-4684-8f15-72874a76bbc3',
                    'val': '3',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '50f62a9f-8c67-40e1-aebd-cc7ede2b6e0a',
                      'choice_id': 'dc546a28-b1e5-4bda-8671-d6cc2cbc4605',
                      'sort_order': 3,
                      'id': '6f374bb3-2230-4c66-8c84-c0fbcaad2c51',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': '3221dfd4-cce0-4684-8f15-72874a76bbc3',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '7426e031-7940-4ae9-96ba-c80f8a033547',
                          'translation_id': '3221dfd4-cce0-4684-8f15-72874a76bbc3',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Más de la mitad de los días',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'cfb05ed1-97ea-43ea-865f-3e9c0a1f6afb',
                          'translation_id': '3221dfd4-cce0-4684-8f15-72874a76bbc3',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'More than half the days',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '32884343-f903-4505-b1dc-872b9c528bd4',
                    'choice_translation_id': 'b1828190-9411-4eba-b8d3-9c09d7a1f330',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '50f62a9f-8c67-40e1-aebd-cc7ede2b6e0a',
                      'choice_id': '32884343-f903-4505-b1dc-872b9c528bd4',
                      'sort_order': 1,
                      'id': '8e80fbc9-700d-473b-b654-f58c5bea36f0',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': 'b1828190-9411-4eba-b8d3-9c09d7a1f330',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '72cf7385-931a-49a4-8009-674d0dc4a709',
                          'translation_id': 'b1828190-9411-4eba-b8d3-9c09d7a1f330',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Ningún día',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'e9ba401a-77c6-44da-a7ea-27025bd8886b',
                          'translation_id': 'b1828190-9411-4eba-b8d3-9c09d7a1f330',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Not at all',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'ff1ee282-531c-447d-a374-c7c7e30f8af5',
                    'choice_translation_id': 'f16c1812-9932-4e93-8ffc-df755cba3b75',
                    'val': '4',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '50f62a9f-8c67-40e1-aebd-cc7ede2b6e0a',
                      'choice_id': 'ff1ee282-531c-447d-a374-c7c7e30f8af5',
                      'sort_order': 4,
                      'id': '962fcd08-9e63-49b0-9cc8-cf3e368de17c',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': 'f16c1812-9932-4e93-8ffc-df755cba3b75',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '08d6e85b-4258-426e-ba9c-c78bbda9f30e',
                          'translation_id': 'f16c1812-9932-4e93-8ffc-df755cba3b75',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Nearly every day',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '992e8e50-9665-4852-9864-0acf6b676e5e',
                          'translation_id': 'f16c1812-9932-4e93-8ffc-df755cba3b75',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Casi todos los días',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'cc3ddcfb-b9a4-49ea-809f-60ef926ed22e',
                    'choice_translation_id': '917a2a9c-b45b-4b47-817e-2a6124891e0e',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '50f62a9f-8c67-40e1-aebd-cc7ede2b6e0a',
                      'choice_id': 'cc3ddcfb-b9a4-49ea-809f-60ef926ed22e',
                      'sort_order': 2,
                      'id': 'd38914fb-8322-4ad1-8cba-c13e7808f673',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': '917a2a9c-b45b-4b47-817e-2a6124891e0e',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '3d534e4c-b40b-4be8-9ef2-a1c0354c4667',
                          'translation_id': '917a2a9c-b45b-4b47-817e-2a6124891e0e',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Varios días',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'e2b8b015-7d3e-4c12-8cd4-0c2886f41d62',
                          'translation_id': '917a2a9c-b45b-4b47-817e-2a6124891e0e',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Several days',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': 'f6010777-11be-4d70-b868-456bc2d15615',
                  'created_at': '2017-08-24 14:44:19',
                  'updated_at': '2017-08-24 14:44:19',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '3e675912-eef4-4447-9291-1bbebebe4292',
                      'translation_id': 'f6010777-11be-4d70-b868-456bc2d15615',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Feeling down, depressed, or hopeless',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': '5b944c32-5f6b-47f2-8b4b-72ece4e23b30',
                      'translation_id': 'f6010777-11be-4d70-b868-456bc2d15615',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Se ha sentido decaído(a), deprimido(a) o sin esperanzas',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          },
          {
            'id': '943474cd-6d7b-4b5e-afd0-1a1d4edfe698',
            'created_at': '2017-08-24 14:44:20',
            'updated_at': '2017-08-24 14:44:20',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '943474cd-6d7b-4b5e-afd0-1a1d4edfe698',
              'question_group_order': 17,
              'created_at': '2017-08-24 14:44:20',
              'updated_at': '2017-08-24 14:44:20'
            },
            'questions': [
              {
                'id': 'e5c51234-a756-4d75-a338-3410d317b7ad',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': '08d27323-fb5b-4d71-b14f-ef09f854e800',
                'question_group_id': '943474cd-6d7b-4b5e-afd0-1a1d4edfe698',
                'sort_order': 1,
                'var_name': 'd0700',
                'created_at': '2017-08-24 14:44:20',
                'updated_at': '2017-08-24 14:44:20',
                'deleted_at': null,
                'choices': [
                  {
                    'id': 'f2c97ffa-bca3-4778-8419-9489f91349e9',
                    'choice_translation_id': 'a28ae7da-18b2-4177-8b63-972ac7b95feb',
                    'val': '3',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'e5c51234-a756-4d75-a338-3410d317b7ad',
                      'choice_id': 'f2c97ffa-bca3-4778-8419-9489f91349e9',
                      'sort_order': 3,
                      'id': '35d60db3-665f-46be-a84d-d56f42d2f5a2',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'a28ae7da-18b2-4177-8b63-972ac7b95feb',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '3b001bcc-ec12-42d0-ad6b-9c4c7d144a3a',
                          'translation_id': 'a28ae7da-18b2-4177-8b63-972ac7b95feb',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'It is not sufficient and there are difficulties',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'b9d8d597-3abc-4dab-abd6-38d343c417ad',
                          'translation_id': 'a28ae7da-18b2-4177-8b63-972ac7b95feb',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No les alcanza y tienen dificultades',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'fec932f6-7e07-4aed-953a-3b4ea399d507',
                    'choice_translation_id': '3e5e7b37-08ba-48ca-919f-ea8fe5b12a8d',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'e5c51234-a756-4d75-a338-3410d317b7ad',
                      'choice_id': 'fec932f6-7e07-4aed-953a-3b4ea399d507',
                      'sort_order': 1,
                      'id': '945d7757-08ff-4909-a60f-be44174fc6f7',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '3e5e7b37-08ba-48ca-919f-ea8fe5b12a8d',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '049cdf03-2cc6-468d-9612-ed91b4a9b893',
                          'translation_id': '3e5e7b37-08ba-48ca-919f-ea8fe5b12a8d',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Les alcanza bien y pueden ahorrar',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '39df96e4-34d6-41fe-82bb-758429473a93',
                          'translation_id': '3e5e7b37-08ba-48ca-919f-ea8fe5b12a8d',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'There is enough to live on and save',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '4252b46b-0e54-4e6f-b14d-dbfda948bf1e',
                    'choice_translation_id': '74efeff5-5ed9-4b44-9ec4-5ce14a84c158',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'e5c51234-a756-4d75-a338-3410d317b7ad',
                      'choice_id': '4252b46b-0e54-4e6f-b14d-dbfda948bf1e',
                      'sort_order': 2,
                      'id': 'd980615b-403f-4f0f-af1e-f0a9329173f8',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '74efeff5-5ed9-4b44-9ec4-5ce14a84c158',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '70f1f6f2-7a09-46a4-940d-7f9bbebbb184',
                          'translation_id': '74efeff5-5ed9-4b44-9ec4-5ce14a84c158',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Les alcanza justo, sin grandes dificultades',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'f8af9e34-c0b5-4186-957f-81c02a010f03',
                          'translation_id': '74efeff5-5ed9-4b44-9ec4-5ce14a84c158',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'It is sufficient, without major difficulties',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '5990c165-873a-4804-8add-2fe4bf830d21',
                    'choice_translation_id': '1f97015d-ada0-4ce5-9d25-c14eaed0ac3a',
                    'val': '4',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': 'e5c51234-a756-4d75-a338-3410d317b7ad',
                      'choice_id': '5990c165-873a-4804-8add-2fe4bf830d21',
                      'sort_order': 4,
                      'id': 'de077ba2-03d3-4e73-9f2b-3412d58042e7',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': '1f97015d-ada0-4ce5-9d25-c14eaed0ac3a',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '05f8ca18-d6cf-4047-8f25-dd1edb750140',
                          'translation_id': '1f97015d-ada0-4ce5-9d25-c14eaed0ac3a',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'It is not sufficient and there are major difficulties',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'ad66c268-9691-4376-b589-fa2c1d54bef8',
                          'translation_id': '1f97015d-ada0-4ce5-9d25-c14eaed0ac3a',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No les alcanza y tienen grandes dificultades',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': '08d27323-fb5b-4d71-b14f-ef09f854e800',
                  'created_at': '2017-08-24 14:44:20',
                  'updated_at': '2017-08-24 14:44:20',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '1d62fb38-8d07-40d3-8c58-e4a771afa601',
                      'translation_id': '08d27323-fb5b-4d71-b14f-ef09f854e800',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'With the total family income, would you say that...',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': 'c38a1ed0-793b-4cef-95f2-abd935242a28',
                      'translation_id': '08d27323-fb5b-4d71-b14f-ef09f854e800',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Pensando en el ingreso total de su familia, diría usted que...',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          },
          {
            'id': '56bb34d7-88cc-44ef-a0c2-285e02e088c9',
            'created_at': '2017-08-24 14:44:19',
            'updated_at': '2017-08-24 14:44:19',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': '56bb34d7-88cc-44ef-a0c2-285e02e088c9',
              'question_group_order': 4,
              'created_at': '2017-08-24 14:44:19',
              'updated_at': '2017-08-24 14:44:19'
            },
            'questions': [
              {
                'id': '929e2207-0e78-4494-af8d-ab3473f7e92b',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': 'db29b874-40ca-4525-a8ae-3f68aa69aa89',
                'question_group_id': '56bb34d7-88cc-44ef-a0c2-285e02e088c9',
                'sort_order': 1,
                'var_name': 'c0300',
                'created_at': '2017-08-24 14:44:19',
                'updated_at': '2017-08-24 14:44:19',
                'deleted_at': null,
                'choices': [
                  {
                    'id': 'f9ceb662-fe52-4d4d-b774-b6a93b2b712a',
                    'choice_translation_id': '9f25cecf-e476-486b-b069-5cf5f71ec29a',
                    'val': '4',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '929e2207-0e78-4494-af8d-ab3473f7e92b',
                      'choice_id': 'f9ceb662-fe52-4d4d-b774-b6a93b2b712a',
                      'sort_order': 4,
                      'id': '2e225ebf-6ad3-47d2-bdc9-eb725ba55b50',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': '9f25cecf-e476-486b-b069-5cf5f71ec29a',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '5f008da6-0524-4ed8-a213-0b30af1308f2',
                          'translation_id': '9f25cecf-e476-486b-b069-5cf5f71ec29a',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Casi todos los días',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'dfc8bd75-f90b-4422-9e4c-04c6618e0710',
                          'translation_id': '9f25cecf-e476-486b-b069-5cf5f71ec29a',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Nearly every day',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'fa99fd14-b09c-44c8-aa6e-47deb859d1aa',
                    'choice_translation_id': '4f8f80cc-ebcf-45ab-bf3e-9b0b24576341',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '929e2207-0e78-4494-af8d-ab3473f7e92b',
                      'choice_id': 'fa99fd14-b09c-44c8-aa6e-47deb859d1aa',
                      'sort_order': 1,
                      'id': '670334af-0f78-4bc1-bfa3-5b77cef7baea',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': '4f8f80cc-ebcf-45ab-bf3e-9b0b24576341',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '07f27bf4-d5ab-46a2-9b77-a296b3dbf224',
                          'translation_id': '4f8f80cc-ebcf-45ab-bf3e-9b0b24576341',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Ningún día',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'a216089b-3df5-4f03-9750-b2eb75ea5f0c',
                          'translation_id': '4f8f80cc-ebcf-45ab-bf3e-9b0b24576341',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Not at all',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '8f0b41d7-866b-4d83-87a1-819d190af6f6',
                    'choice_translation_id': '35af2f01-36f9-486f-8547-6c3c603c7212',
                    'val': '3',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '929e2207-0e78-4494-af8d-ab3473f7e92b',
                      'choice_id': '8f0b41d7-866b-4d83-87a1-819d190af6f6',
                      'sort_order': 3,
                      'id': '9c35e96c-bb86-41e6-8e1c-d93f5f82634f',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': '35af2f01-36f9-486f-8547-6c3c603c7212',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '255dbaf6-d528-4e17-b7de-a5d5ad52e660',
                          'translation_id': '35af2f01-36f9-486f-8547-6c3c603c7212',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Más de la mitad de los días',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'ba1e2db5-6626-4a0e-b334-a983b7869d5b',
                          'translation_id': '35af2f01-36f9-486f-8547-6c3c603c7212',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'More than half the days',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': '948a6d49-a4c1-45d4-800a-e2ed13b32e6f',
                    'choice_translation_id': 'd1033446-b522-4d1d-8759-7e21bc9d4135',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:20',
                    'updated_at': '2017-08-24 14:44:20',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '929e2207-0e78-4494-af8d-ab3473f7e92b',
                      'choice_id': '948a6d49-a4c1-45d4-800a-e2ed13b32e6f',
                      'sort_order': 2,
                      'id': 'fb186d1f-9335-437f-a8c2-c270aa00d117',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20'
                    },
                    'choice_translation': {
                      'id': 'd1033446-b522-4d1d-8759-7e21bc9d4135',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '483265d7-3927-4d7d-95e9-29c33ffcbd08',
                          'translation_id': 'd1033446-b522-4d1d-8759-7e21bc9d4135',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Varios días',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': '5ba64df9-0a42-40d4-8b20-27ff6285f088',
                          'translation_id': 'd1033446-b522-4d1d-8759-7e21bc9d4135',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Several days',
                          'created_at': '2017-08-24 14:44:20',
                          'updated_at': '2017-08-24 14:44:20',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': 'db29b874-40ca-4525-a8ae-3f68aa69aa89',
                  'created_at': '2017-08-24 14:44:19',
                  'updated_at': '2017-08-24 14:44:19',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '1092dc87-fc32-4486-b974-42e6d473268c',
                      'translation_id': 'db29b874-40ca-4525-a8ae-3f68aa69aa89',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Over the last 2 weeks, how often have you been bothered by any of the following problems? Little interest or pleasure in doing things',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': '840f1dea-f09e-4616-8154-1bb6dd73387f',
                      'translation_id': 'db29b874-40ca-4525-a8ae-3f68aa69aa89',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'En las útimas dos semanas, que tan seguido le han molestado los siguientes problemas: Poco interés o placer en hacer cosas',
                      'created_at': '2017-08-24 14:44:19',
                      'updated_at': '2017-08-24 14:44:19',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          },
          {
            'id': 'a3d3a38c-326a-4bc8-9a61-2ce6139e2159',
            'created_at': '2017-08-24 14:44:20',
            'updated_at': '2017-08-24 14:44:20',
            'deleted_at': null,
            'pivot': {
              'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
              'question_group_id': 'a3d3a38c-326a-4bc8-9a61-2ce6139e2159',
              'question_group_order': 18,
              'created_at': '2017-08-24 14:44:20',
              'updated_at': '2017-08-24 14:44:20'
            },
            'questions': [
              {
                'id': '7b5e8bf4-ee35-4a98-a23d-5f93779330b5',
                'question_type_id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                'question_translation_id': 'f5b49432-cf17-4904-b5d0-392e3a4267e6',
                'question_group_id': 'a3d3a38c-326a-4bc8-9a61-2ce6139e2159',
                'sort_order': 1,
                'var_name': 'd9999',
                'created_at': '2017-08-24 14:44:20',
                'updated_at': '2017-08-24 14:44:20',
                'deleted_at': null,
                'choices': [
                  {
                    'id': '15314a43-15b0-4629-bff0-5e19cb502c6c',
                    'choice_translation_id': 'a025c399-053c-4bd5-bfdb-ad2ff8a5452f',
                    'val': '2',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7b5e8bf4-ee35-4a98-a23d-5f93779330b5',
                      'choice_id': '15314a43-15b0-4629-bff0-5e19cb502c6c',
                      'sort_order': 2,
                      'id': '43627c8f-6ac8-460e-a586-db2012b07a25',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'a025c399-053c-4bd5-bfdb-ad2ff8a5452f',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '68a69e29-1549-45dc-9de0-55e1350321fa',
                          'translation_id': 'a025c399-053c-4bd5-bfdb-ad2ff8a5452f',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'b1478151-80cc-46cf-b3d8-c793efabf3fe',
                          'translation_id': 'a025c399-053c-4bd5-bfdb-ad2ff8a5452f',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'No',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  },
                  {
                    'id': 'c213c953-9da9-4921-8f09-861206d6b3a0',
                    'choice_translation_id': 'aa93261a-d84b-4af7-8f07-9625967eabef',
                    'val': '1',
                    'created_at': '2017-08-24 14:44:21',
                    'updated_at': '2017-08-24 14:44:21',
                    'deleted_at': null,
                    'pivot': {
                      'question_id': '7b5e8bf4-ee35-4a98-a23d-5f93779330b5',
                      'choice_id': 'c213c953-9da9-4921-8f09-861206d6b3a0',
                      'sort_order': 1,
                      'id': 'ea21ef1e-664d-4f16-9c25-a3286c4c7e09',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21'
                    },
                    'choice_translation': {
                      'id': 'aa93261a-d84b-4af7-8f07-9625967eabef',
                      'created_at': '2017-08-24 14:44:21',
                      'updated_at': '2017-08-24 14:44:21',
                      'deleted_at': null,
                      'translation_text': [
                        {
                          'id': '3604662f-e9b3-4f2a-882f-63a2efe9a499',
                          'translation_id': 'aa93261a-d84b-4af7-8f07-9625967eabef',
                          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Sí',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'es',
                            'language_name': 'Spanish',
                            'language_native': 'español',
                            'created_at': '2017-06-21 20:53:53',
                            'updated_at': '2017-06-21 20:53:53',
                            'deleted_at': null
                          }
                        },
                        {
                          'id': 'ab5b734d-d3d6-4a7a-b692-7ef727cc35bb',
                          'translation_id': 'aa93261a-d84b-4af7-8f07-9625967eabef',
                          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                          'translated_text': 'Yes',
                          'created_at': '2017-08-24 14:44:21',
                          'updated_at': '2017-08-24 14:44:21',
                          'deleted_at': null,
                          'locale': {
                            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                            'language_tag': 'en',
                            'language_name': 'English',
                            'language_native': 'English',
                            'created_at': '2017-06-21 20:53:51',
                            'updated_at': '2017-06-21 20:53:51',
                            'deleted_at': null
                          }
                        }
                      ]
                    }
                  }
                ],
                'question_translation': {
                  'id': 'f5b49432-cf17-4904-b5d0-392e3a4267e6',
                  'created_at': '2017-08-24 14:44:20',
                  'updated_at': '2017-08-24 14:44:20',
                  'deleted_at': null,
                  'translation_text': [
                    {
                      'id': '26812545-1e1b-4962-a074-b27745357edd',
                      'translation_id': 'f5b49432-cf17-4904-b5d0-392e3a4267e6',
                      'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'This is the final question in the form. Is the form complete?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'en',
                        'language_name': 'English',
                        'language_native': 'English',
                        'created_at': '2017-06-21 20:53:51',
                        'updated_at': '2017-06-21 20:53:51',
                        'deleted_at': null
                      }
                    },
                    {
                      'id': '38f3f43f-9707-4ac1-b609-f874587c2418',
                      'translation_id': 'f5b49432-cf17-4904-b5d0-392e3a4267e6',
                      'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                      'translated_text': 'Esta es la ultima pregunta en este formulario. Esta completo el formulario?',
                      'created_at': '2017-08-24 14:44:20',
                      'updated_at': '2017-08-24 14:44:20',
                      'deleted_at': null,
                      'locale': {
                        'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
                        'language_tag': 'es',
                        'language_name': 'Spanish',
                        'language_native': 'español',
                        'created_at': '2017-06-21 20:53:53',
                        'updated_at': '2017-06-21 20:53:53',
                        'deleted_at': null
                      }
                    }
                  ]
                },
                'question_type': {
                  'id': 'b58f23fa-52c7-435e-9b31-5fb771e79f41',
                  'name': 'multiple_choice',
                  'created_at': '2017-06-21 20:53:50',
                  'updated_at': '2017-06-21 20:53:50',
                  'deleted_at': null
                },
                'question_parameters': [
                  {
                    'id': '963e7e20-c38a-457c-9327-4a6d5c50e9da',
                    'question_id': '7b5e8bf4-ee35-4a98-a23d-5f93779330b5',
                    'parameter_id': '7',
                    'val': 'false',
                    'created_at': '2017-12-15 15:50:15',
                    'updated_at': '2017-12-15 15:51:37',
                    'deleted_at': null,
                    'parameter': {
                      'id': '7',
                      'name': 'show_rf',
                      'created_at': '2017-08-07 20:12:53',
                      'updated_at': '2017-08-07 20:12:53',
                      'deleted_at': null
                    }
                  },
                  {
                    'id': 'b27ef53b-d676-47e1-b573-dc914fec0419',
                    'question_id': '7b5e8bf4-ee35-4a98-a23d-5f93779330b5',
                    'parameter_id': '6',
                    'val': 'false',
                    'created_at': '2017-12-15 15:50:01',
                    'updated_at': '2017-12-15 15:51:43',
                    'deleted_at': null,
                    'parameter': {
                      'id': '6',
                      'name': 'show_dk',
                      'created_at': '2017-08-07 20:12:53',
                      'updated_at': '2017-08-07 20:12:53',
                      'deleted_at': null
                    }
                  }
                ],
                'assign_condition_tags': []
              }
            ],
            'skips': []
          }
        ],
        'name_translation': {
          'id': '68202c33-69ef-4608-bd7d-4695d9069097',
          'created_at': '2017-08-24 14:44:19',
          'updated_at': '2017-08-24 14:44:19',
          'deleted_at': null,
          'translation_text': [
            {
              'id': '7921ab51-c399-46bc-ba57-43ce0dce5aa7',
              'translation_id': '68202c33-69ef-4608-bd7d-4695d9069097',
              'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
              'translated_text': 'General Health',
              'created_at': '2017-08-24 14:44:19',
              'updated_at': '2017-08-24 14:44:19',
              'deleted_at': null,
              'locale': {
                'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
                'language_tag': 'en',
                'language_name': 'English',
                'language_native': 'English',
                'created_at': '2017-06-21 20:53:51',
                'updated_at': '2017-06-21 20:53:51',
                'deleted_at': null
              }
            }
          ]
        },
        'form_sections': [
          {
            'id': 'd6066764-12fc-4f8b-85f4-74ad59e339bd',
            'form_id': '03551748-f180-44fa-9d58-c6b720c095e9',
            'section_id': '6c8bead4-6e13-4fe5-b28c-ecd25cf22761',
            'sort_order': 1,
            'is_repeatable': '0',
            'max_repetitions': 0,
            'repeat_prompt_translation_id': null,
            'follow_up_question_id': null,
            'created_at': '2017-08-24 14:44:19',
            'updated_at': '2017-08-24 14:44:19',
            'deleted_at': null,
            'repeat_prompt_translation': null
          }
        ]
      }
    ],
    'name_translation': {
      'id': 'fb1ad732-5712-485e-82bd-3e81c5de0bdf',
      'created_at': '2017-08-24 14:43:34',
      'updated_at': '2017-08-24 14:43:34',
      'deleted_at': null,
      'translation_text': [
        {
          'id': '52fc7fdf-26e0-4a46-b3ec-04d453f97d3e',
          'translation_id': 'fb1ad732-5712-485e-82bd-3e81c5de0bdf',
          'locale_id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
          'translated_text': '2. Form 2: V5',
          'created_at': '2017-08-25 14:30:14',
          'updated_at': '2018-01-12 15:45:16',
          'deleted_at': null,
          'locale': {
            'id': '4a1d88ab-84d4-11e5-ba05-0800279114ca',
            'language_tag': 'es',
            'language_name': 'Spanish',
            'language_native': 'español',
            'created_at': '2017-06-21 20:53:53',
            'updated_at': '2017-06-21 20:53:53',
            'deleted_at': null
          }
        },
        {
          'id': '7bbf59df-8e4e-47d6-a519-01885084924f',
          'translation_id': 'fb1ad732-5712-485e-82bd-3e81c5de0bdf',
          'locale_id': '48984fbe-84d4-11e5-ba05-0800279114ca',
          'translated_text': '2. Form 2: V5',
          'created_at': '2017-08-24 14:43:34',
          'updated_at': '2018-01-12 21:41:50',
          'deleted_at': null,
          'locale': {
            'id': '48984fbe-84d4-11e5-ba05-0800279114ca',
            'language_tag': 'en',
            'language_name': 'English',
            'language_native': 'English',
            'created_at': '2017-06-21 20:53:51',
            'updated_at': '2017-06-21 20:53:51',
            'deleted_at': null
          }
        }
      ]
    }
  }
}

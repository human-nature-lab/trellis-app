import { Document, Paragraph, HeadingLevel, Packer, TextRun, TabStopType, TabStopPosition, LevelFormat, AlignmentType } from 'docx'
import Locale from '../../entities/trellis/Locale'
import Form from '../../entities/trellis/Form'
import TranslationService from '../TranslationService'
import { i18n } from '@/i18n'
import Question from '@/entities/trellis/Question'
import PT from '@/static/parameter.types'

export type DocxOpts = {
  choices: boolean
  parameters: boolean
  assignments: boolean
  pageTitles: boolean
  pageHeaders: boolean
  pageSkips: boolean
  questionNumbers: boolean
  sectionHeaders: boolean
  showDkRf: boolean
}

const defaultOpts: DocxOpts = {
  choices: true,
  parameters: true,
  pageSkips: true,
  assignments: true,
  pageTitles: true,
  pageHeaders: true,
  questionNumbers: true,
  sectionHeaders: true,
  showDkRf: true,
}

export class DocService {
  static transformScriptToText (str: string) {
    const children = []
    const lines = str.trim().split('\n')
    for (const line of lines) {
      children.push(new TextRun({ text: line, break: 1, font: 'Consolas', size: '10pt' }))
    }
    return children
  }

  static async formToDocx (form: Form, locale: Locale, opts: Partial<DocxOpts> = defaultOpts) {
    const sections = []
    let questionNum = 0
    let hasCreatedTitle = false
    const questionMap = new Map<string, Question>()
    for (const section of form.sections) {
      const children = []
      if (!hasCreatedTitle) {
        children.push(new Paragraph({
          text: TranslationService.getAny(form.nameTranslation, locale),
          heading: HeadingLevel.TITLE,
        }))
        hasCreatedTitle = true
      }
      if (opts.sectionHeaders) {
        children.push(new Paragraph({
          text: 'Section: ' + TranslationService.getAny(section.nameTranslation, locale),
          heading: HeadingLevel.HEADING_2,
        }))
        const followUpId = section.followUpQuestionId || section.formSections[0].followUpQuestionId
        if (followUpId) {
          const isRandomized = section.formSections[0].randomizeFollowUp
          const followUpQ = questionMap.get(followUpId)
          if (!followUpQ) {
            throw new Error('Follow up question not found: ' + followUpId)
          }
          children.push(new Paragraph({
            children: [
              new TextRun('For each value in '),
              new TextRun({
                text: followUpQ.varName,
                bold: true,
              }),
              new TextRun(' ' + (isRandomized ? i18n.t('randomly') : i18n.t('sequentially'))),
            ],
          }))
        }
      }
      for (let i = 0; i < section.pages.length; i++) {
        const page = section.pages[i]
        if (opts.pageTitles) {
          children.push(new Paragraph({
            text: i18n.t('page_n', [i + 1]) + '',
            heading: HeadingLevel.HEADING_3,
          }))
        } else if (opts.pageHeaders) {
          children.push(new Paragraph({ text: ' ', heading: HeadingLevel.HEADING_3 }))
        }
        if (opts.pageSkips && page.skips) {
          for (const skip of page.skips) {
            if (skip.customLogic) {
              children.push(new Paragraph({
                children: DocService.transformScriptToText(skip.customLogic),
              }))
            } else {
              children.push(new Paragraph({
                children: [
                  new TextRun({
                    text: skip.showHide ? 'Show' : 'Hide',
                    bold: true,
                  }),
                  new TextRun(' the page if '),
                  new TextRun({
                    text: skip.anyAll ? 'all' : 'any',
                    bold: true,
                  }),
                  new TextRun(' of these conditions are assigned: '),
                  new TextRun({
                    text: skip.conditionTags.map(c => c.conditionTagName).join(', '),
                    bold: true,
                  }),
                ],
              }))
            }
          }
        }
        for (const question of page.questions) {
          questionMap.set(question.id, question)
          questionNum++
          // Question header
          children.push(new Paragraph({
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: TabStopPosition.MAX,
              },
            ],
            thematicBreak: true,
            heading: HeadingLevel.HEADING_4,
            children: [
              new TextRun({
                text: `${questionNum}. ${question.varName}`,
                bold: true,
              }),
              new TextRun({
                text: '\t' + question.questionType.name,
              }),
            ],
          }))
          // Question content
          children.push(new Paragraph({
            text: TranslationService.getAny(question.questionTranslation, locale),
          }))
          if (opts.choices && question.choices && question.choices.length) {
            for (const choice of question.choices) {
              const name = TranslationService.getAny(choice.choice.choiceTranslation, locale)
              const val = choice.choice.val
              const text = `${val}) ${name}`
              children.push(new Paragraph({
                text,
                numbering: {
                  reference: 'choice-vals',
                  level: 0,
                },
              }))
            }
          }
          if (opts.showDkRf) {
            const dkParameter = question.questionParameters.find(p => +p.parameterId === PT.show_dk)
            const rfParameter = question.questionParameters.find(p => +p.parameterId === PT.show_rf)
            const choices = []
            if (!dkParameter || !!dkParameter.val) {
              choices.push(i18n.t('dont_know') as string)
            }
            if (!rfParameter || !!rfParameter.val) {
              choices.push(i18n.t('refused') as string)
            }
            if (choices.length) {
              children.push(new Paragraph({
                children: [
                  new TextRun('(respondent can opt out by saying: ' + choices.join(', ') + ')'),
                ],
              }))
            }
          }
          if (opts.parameters && question.questionParameters && question.questionParameters.length) {
            children.push(new Paragraph({ text: 'Parameters', heading: HeadingLevel.HEADING_5 }))
            for (const param of question.questionParameters) {
              children.push(new Paragraph({
                text: `${param.parameter.name}: ${param.val}`,
              }))
            }
          }
          if (opts.assignments && question.assignConditionTags && question.assignConditionTags.length) {
            children.push(new Paragraph({ text: 'Assignments', heading: HeadingLevel.HEADING_5 }))
            for (const asn of question.assignConditionTags) {
              children.push(new Paragraph({
                text: `${asn.conditionTag.name}: ${asn.logic}`,
              }))
            }
          }
        }
      }
      if (children.length) {
        sections.push({
          children,
        })
      }
    }
    const questionSpaceBefore = 20 * 72 * 0.2
    const pageSpaceBefore = questionSpaceBefore * 2
    const doc = new Document({
      numbering: {
        config: [
          {
            reference: 'choice-vals',
            levels: [
              {
                level: 0,
                format: LevelFormat.NONE,
                text: '%1',
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: { left: 300 },
                  },
                },
              },
            ],
          },
        ],
      },
      styles: {
        default: {
          heading2: {
            paragraph: {
              spacing: { before: pageSpaceBefore },
            },
          },
          heading3: {
            paragraph: {
              spacing: { before: pageSpaceBefore },
            },
          },
          heading4: {
            run: {
              font: 'Calibri',
              size: 24,
              bold: true,
              // allCaps: true,
            },
            paragraph: {
              spacing: { before: questionSpaceBefore },
            },
          },
          heading5: {
            run: {
              font: 'Calibri',
              size: 20,
              bold: true,
              color: '2E74B5',
            },
          },
        },
      },
      sections,
    })
    return Packer.toBlob(doc)
  }
}

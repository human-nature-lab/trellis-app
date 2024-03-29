import { Document, Paragraph, HeadingLevel, Packer, TextRun, TabStopType, TabStopPosition } from 'docx'
import Locale from '../../entities/trellis/Locale'
import Form from '../../entities/trellis/Form'
import TranslationService from '../TranslationService'

type DocxOpts = {
  choices: boolean
  parameters: boolean
  pageSkips: boolean
  assignments: boolean
}

const defaultOpts: DocxOpts = {
  choices: true,
  parameters: true,
  pageSkips: true,
  assignments: true,
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
    for (const section of form.sections) {
      const children = []
      if (!hasCreatedTitle) {
        children.push(new Paragraph({
          text: TranslationService.getAny(form.nameTranslation, locale),
          heading: HeadingLevel.TITLE,
        }))
        hasCreatedTitle = true
      }
      children.push(new Paragraph({
        text: 'Section: ' + TranslationService.getAny(section.nameTranslation, locale),
        heading: HeadingLevel.HEADING_2,
      }))
      for (const page of section.pages) {
        children.push(new Paragraph({ text: ' ', heading: HeadingLevel.HEADING_3 }))
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
                    text: skip.anyAll ? 'any' : 'all',
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
              children.push(new Paragraph({
                text: TranslationService.getAny(choice.choice.choiceTranslation, locale),
                bullet: { level: 0 },
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

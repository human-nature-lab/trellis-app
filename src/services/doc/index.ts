import {
  Document,
  Paragraph,
  HeadingLevel,
  Packer,
  TextRun,
  TabStopType,
  TabStopPosition,
  LevelFormat,
  AlignmentType,
} from 'docx'
import ExcelJS from 'exceljs'
import Locale from '../../entities/trellis/Locale'
import Form from '../../entities/trellis/Form'
import TranslationService from '../TranslationService'
import { i18n } from '@/i18n'
import Question from '@/entities/trellis/Question'
import PT from '@/static/parameter.types'
import FormService from '@/services/form'
import Translation from '@/entities/trellis/Translation'
import TranslationText from '@/entities/trellis/TranslationText'
import Papa from 'papaparse'
const zipjs = () => import(/* webpackChunkName: "zipjs" */'@zip.js/zip.js')
const saver = () => import(/* webpackChunkName: "file-saver" */'file-saver')

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

export const defaultOpts: DocxOpts = {
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

export type TranslationRow = {
  type: string
  ownerId: string
  varName?: string
  translation: Translation
}

function sortByLocale (a: TranslationText, b: TranslationText) {
  return a.locale.languageTag.localeCompare(b.locale.languageTag)
}

export type ExcelColumn = Partial<ExcelJS.Column> & { alignment?: Partial<ExcelJS.Alignment> }

export class DocService {
  static transformScriptToText (str: string) {
    const children = []
    const lines = str.trim().split('\n')
    for (const line of lines) {
      children.push(new TextRun({ text: line, break: 1, font: 'Consolas', size: '10pt' }))
    }
    return children
  }

  static getFormName (form: Form, locale: Locale, ext = 'docx', suffix = '') {
    const name = TranslationService.getAny(form.nameTranslation, locale)
    return `${name}_v${form.version}_${locale.languageTag}${suffix}.${ext}`
  }

  // Conver multiple forms to docx and return as a zipped blob
  static async multipleFormsToDocx (formIds: string[], loc: Locale, opts: Partial<DocxOpts> = defaultOpts): Promise<Blob> {
    // load the zip service
    const z = await zipjs()
    const { BlobWriter, BlobReader, ZipWriter } = z
    const zip = new BlobWriter()
    const writer = new ZipWriter(zip)
    for (const id of formIds) {
      const form = await FormService.getForm(id)
      const blob = await this.formToDocx(form, loc, opts)
      const name = this.getFormName(form, loc)
      const reader = new BlobReader(blob)
      await writer.add(name, reader)
    }
    await writer.close()
    return zip.getData()
  }

  // Convert a form to a docx blob
  static async formToDocx (form: Form, locale: Locale, opts: Partial<DocxOpts> = defaultOpts) {
    const sections = []
    let questionNum = 0
    let hasCreatedTitle = false
    const questionMap = new Map<string, Question>()
    form.sort()
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
              choices.push(i18n.t('do_not_know') as string)
            }
            if (!rfParameter || !!rfParameter.val) {
              choices.push(i18n.t('refuse_to_answer') as string)
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

  static formToTranslationRows (form: Form) {
    const translations: TranslationRow[] = []
    if (!form) return translations
    const f = form
    f.nameTranslation.translationText.sort(sortByLocale)
    translations.push({
      type: 'form',
      ownerId: form.id,
      translation: f.nameTranslation,
    })
    for (const section of form.sections) {
      section.nameTranslation.translationText.sort(sortByLocale)
      translations.push({
        type: 'section',
        ownerId: section.id,
        translation: section.nameTranslation,
      })
      for (const qg of section.questionGroups) {
        for (const question of qg.questions) {
          question.questionTranslation.translationText.sort(sortByLocale)
          translations.push({
            type: 'question',
            ownerId: question.id,
            varName: question.varName,
            translation: question.questionTranslation,
          })
          for (const choice of question.choices) {
            choice.choice.choiceTranslation.translationText.sort(sortByLocale)
            translations.push({
              type: 'choice',
              ownerId: choice.choice.id,
              varName: question.varName,
              translation: choice.choice.choiceTranslation,
            })
          }
        }
      }
    }
  }

  static async formToTranslationCsv (form: Form) {
    const translations = this.formToTranslationRows(form)
    const localeMap = new Map<string, Locale>()
    for (const t of translations) {
      for (const tt of t.translation.translationText) {
        localeMap.set(tt.localeId, tt.locale)
      }
    }
    const locales = Array.from(localeMap.entries())
    const fields = ['translation_id', 'var_name', 'type'].concat(locales.map(l => l[1].languageTag))
    const data = translations.map(t => {
      const row = {
        translation_id: t.translation.id,
        var_name: t.varName,
        type: t.type,
      }
      for (const l of locales) {
        const text = t.translation.translationText.find(tt => tt.localeId === l[0])
        row[l[1].languageTag] = text ? text.translatedText : ''
      }
      return row
    })
    return Papa.unparse({ fields, data })
  }

  // Download any blob as a file
  static async saveAs (doc: Blob, name: string) {
    const s = await saver()
    s.saveAs(doc, name)
  }

  static async parseCsv (csv: Blob): Promise<Papa.ParseResult<object[]>> {
    return new Promise((resolve, reject) => {
      Papa.parse<object[]>(csv, {
        header: true,
        complete: resolve,
        error: reject,
      })
    })
  }

  // Convert a zipped blob of CSV files into a single xlsx file with multiple sheets. return as a blob
  static async csvZipToXlsx (zip: Blob, columns?: ExcelColumn[]) {
    const z = await zipjs()
    const { BlobReader, BlobWriter, ZipReader } = z
    const reader = new ZipReader(new BlobReader(zip))
    const entries = await reader.getEntries()
    const wb = new ExcelJS.Workbook()
    const formNames = []
    for (const entry of entries) {
      const csv = await entry.getData(new BlobWriter())
      const res = await this.parseCsv(csv)
      console.log('res', res)
      const name = entry.filename.replace('.csv', '')
      formNames.push(name)
      const ws = wb.addWorksheet(name)
      ws.columns = res.meta.fields.map((f, i) => {
        const col = columns ? columns[i] : {}
        return {
          header: f,
          key: f,
          width: 10,
          ...col,
        }
      })
      for (const record of res.data) {
        const row = []
        for (const key of res.meta.fields) {
          row.push(record[key])
        }
        ws.addRow(row).eachCell((cell, colNumber) => {
          const col = columns ? columns[colNumber - 1] : {}
          if (col.alignment) {
            cell.alignment = col.alignment
          }
        })
      }
    }
    wb.creator = 'Trellis'
    wb.lastModifiedBy = 'Trellis'
    wb.created = new Date()
    wb.modified = new Date()
    wb.description = `Translations for forms: ${formNames.join(', ')}`
    const out = await wb.xlsx.writeBuffer()
    return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  }

  static async filesToZip (...files: File[]) {
    const z = await zipjs()
    const { BlobWriter, BlobReader, ZipWriter } = z
    const zip = new BlobWriter()
    const writer = new ZipWriter(zip)
    for (const file of files) {
      const reader = new BlobReader(file)
      await writer.add(file.name, reader)
    }
    await writer.close()
    return zip.getData()
  }

  static async xlsxToCsvZip (xlsx: Blob) {
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(await xlsx.arrayBuffer())
    const z = await zipjs()
    const { BlobWriter, ZipWriter, BlobReader } = z
    const zip = new BlobWriter()
    const writer = new ZipWriter(zip)
    for (const ws of wb.worksheets) {
      const csv = await wb.csv.writeBuffer({ sheetId: ws.id })
      writer.add(ws.name + '.csv', new BlobReader(new Blob([csv])))
    }
    await writer.close()
    return zip.getData()
  }
}

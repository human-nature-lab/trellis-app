import Translation from '@/entities/trellis/Translation'

export function translate (translation: Translation, localeId: string) {
  if (translation == null) {
    return null
  }
  if (translation.translationText == null) {
    return null
  }
  const tt = translation.translationText.find(tt => tt.localeId == localeId)
  if (!tt) {
    return null
  }
  return tt.translatedText
}

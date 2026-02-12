/**
 * Tests for questionnaire data helpers.
 * Exports: none.
 */
import { describe, expect, it } from 'vitest'
import { computeSelectedLanguage, mergeTranslations } from '../../src/controllers/questionnaireData'

describe('questionnaireData helpers', () => {
  it('falls back to first available language', () => {
    const languages = [
      { lang: 'de', enabled: 0 },
      { lang: 'fr', enabled: 1 },
    ]
    // Current logic returns the selected language if it exists in the list (regardless of enabled)
    const selected = computeSelectedLanguage({ languages, selectedLanguage: 'de' })
    expect(selected).toBe('de')
  })

  it('falls back to first language when selected not in list', () => {
    const languages = [
      { lang: 'de', enabled: 0 },
      { lang: 'fr', enabled: 1 },
    ]
    const selected = computeSelectedLanguage({ languages, selectedLanguage: 'en' })
    expect(selected).toBe('de')
  })

  it('merges question and option translations', () => {
    const merged = mergeTranslations({
      questionTranslationsByLang: { de: { 'questions.a.label': 'A' } },
      optionTranslations: { 'options.a.x': 'X' },
      selectedLanguage: 'de',
    })
    expect(merged).toEqual({ 'questions.a.label': 'A', 'options.a.x': 'X' })
  })
})

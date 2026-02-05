/**
 * Tests for questionnaire translation validation.
 * Exports: none.
 */
import { describe, expect, it } from 'vitest'
import { validateQuestionTranslations } from '../../src/services/questionnaireService'

const languages = [{ lang: 'de' }, { lang: 'fr' }]

describe('questionnaireService', () => {
  it('requires labels for all languages', () => {
    const result = validateQuestionTranslations({
      type: 'text',
      languages,
      valuesByLang: {
        de: { label: 'Hallo' },
        fr: { label: '' },
      },
    })
    expect(result.ok).toBe(false)
  })

  it('requires slider legends', () => {
    const result = validateQuestionTranslations({
      type: 'slider',
      languages,
      valuesByLang: {
        de: { label: 'Gut', legend_low: 'low', legend_high: '' },
        fr: { label: 'Bien', legend_low: 'bas', legend_high: 'haut' },
      },
    })
    expect(result.ok).toBe(false)
  })

  it('accepts complete translations', () => {
    const result = validateQuestionTranslations({
      type: 'slider',
      languages,
      valuesByLang: {
        de: { label: 'Gut', legend_low: 'low', legend_high: 'high' },
        fr: { label: 'Bien', legend_low: 'bas', legend_high: 'haut' },
      },
    })
    expect(result.ok).toBe(true)
  })
})

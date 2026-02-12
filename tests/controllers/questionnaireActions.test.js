/**
 * Tests for questionnaire action helpers.
 * Exports: none.
 */
import { describe, expect, it } from 'vitest'
import { buildNewQuestion, buildQuestionConfig } from '../../src/controllers/questionnaireActions'

describe('questionnaireActions helpers', () => {
  it('builds slider config with numeric coercion', () => {
    const config = buildQuestionConfig({
      type: 'slider',
      values: { min: '0', max: '1', step: '0.01', default: '0.5', use_for_color: true },
    })
    expect(config).toEqual({
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
      use_for_color: true,
    })
  })

  it('assigns default sort when missing', () => {
    const question = buildNewQuestion({
      key: 'new',
      type: 'text',
      required: false,
      isActive: true,
      sort: 0,
      config: { rows: 3 },
      existingQuestions: [{ question_key: 'a', sort: 10 }],
    })
    expect(question.sort).toBe(11)
  })
})

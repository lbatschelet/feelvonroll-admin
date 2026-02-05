/**
 * Tests for questionnaire sort helpers.
 * Exports: none.
 */
import { describe, expect, it } from 'vitest'
import { reorderQuestions } from '../../src/controllers/questionnaireSort'

describe('questionnaireSort', () => {
  it('reorders questions and recalculates sort', () => {
    const questions = [
      { question_key: 'a', sort: 0 },
      { question_key: 'b', sort: 10 },
      { question_key: 'c', sort: 20 },
    ]
    const result = reorderQuestions(questions, 'a', 'c')
    expect(result.map((q) => q.question_key)).toEqual(['b', 'c', 'a'])
    expect(result.map((q) => q.sort)).toEqual([0, 10, 20])
  })
})

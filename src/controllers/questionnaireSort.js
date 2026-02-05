/**
 * Questionnaire sorting helpers for drag-and-drop ordering.
 * Exports: reorderQuestions.
 */
export function reorderQuestions(questions, dragKey, dropKey) {
  const items = [...questions]
  const fromIndex = items.findIndex((question) => question.question_key === dragKey)
  const toIndex = items.findIndex((question) => question.question_key === dropKey)
  if (fromIndex < 0 || toIndex < 0) return items
  const [moved] = items.splice(fromIndex, 1)
  items.splice(toIndex, 0, moved)
  return items.map((question, index) => ({
    ...question,
    sort: index * 10,
  }))
}

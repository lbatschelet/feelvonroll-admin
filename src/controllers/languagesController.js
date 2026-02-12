/**
 * Languages controller for language management page.
 * Uses a modal for create/edit. Exports: createLanguagesController.
 */
import { createQuestionnaireData } from './questionnaireData'
import { createLanguagesRender } from './languagesRender'
import { showModal, hideModal, bindModalClose } from '../utils/adminModal'

export function createLanguagesController({ state, views, api, shell, onLanguagesChanged }) {
  const data = createQuestionnaireData({ state, api })
  const render = createLanguagesRender({ state, views })
  const view = views.languagesView

  let editingLang = null

  const loadLanguages = async () => {
    shell.setStatus('Loading languages...', false)
    try {
      await data.loadLanguages()
      render.renderLanguageSelectors()
      render.renderLanguagesTable()
      shell.setStatus('Languages loaded', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  // ── Modal ──────────────────────────────────────────────────────

  const openModal = (language = null) => {
    editingLang = language
    view.modalTitle.textContent = language ? 'Edit Language' : 'New Language'
    view.codeInput.value = language ? language.lang : ''
    view.codeInput.readOnly = !!language
    view.labelInput.value = language ? language.label : ''
    showModal(view.modal)
    if (!language) view.codeInput.focus()
    else view.labelInput.focus()
  }

  const closeModal = () => {
    hideModal(view.modal)
    editingLang = null
  }

  // ── Save (create or update) ────────────────────────────────────

  const handleSave = async () => {
    const lang = view.codeInput.value.trim()
    const label = view.labelInput.value.trim()
    if (!lang || !label) {
      shell.setStatus('Code and label are required', true)
      return
    }
    try {
      if (editingLang) {
        // Update: keep current enabled state
        await api.upsertLanguage({ token: state.token, lang, label, enabled: Number(editingLang.enabled) === 1 })
      } else {
        // New languages are added as inactive by default
        await api.upsertLanguage({ token: state.token, lang, label, enabled: false })
      }
      closeModal()
      await data.loadLanguages()
      render.renderLanguageSelectors()
      render.renderLanguagesTable()
      await onLanguagesChanged()

      if (editingLang) {
        shell.setStatus(`Language "${lang}" updated`, false)
      } else {
        shell.setStatus(
          `Language "${lang}" added (inactive). Translate all content before activating.`,
          false,
        )
      }
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  // ── Toggle active ──────────────────────────────────────────────

  /**
   * Builds a human-readable summary of missing translations.
   */
  const formatMissing = (missing) => {
    const lines = []
    if (missing.translations?.length) {
      lines.push(`Missing translations (${missing.translations.length}):`)
      missing.translations.forEach((key) => {
        const nice = key.replace(/^questions\./, 'Question: ').replace(/^options\./, 'Option: ')
        lines.push(`  • ${nice}`)
      })
    }
    if (missing.content_pages?.length) {
      lines.push(`Missing content pages (${missing.content_pages.length}):`)
      missing.content_pages.forEach((key) => lines.push(`  • ${key}`))
    }
    return lines.join('\n')
  }

  const handleLanguageToggle = async (input) => {
    const lang = input.dataset.lang
    const enabling = input.checked
    try {
      const result = await api.toggleLanguage({ token: state.token, lang, enabled: enabling })
      if (result.incomplete) {
        const summary = formatMissing(result.missing)
        const forceEnable = window.confirm(
          `Language "${lang}" has incomplete translations:\n\n${summary}\n\nActivate anyway?`
        )
        if (forceEnable) {
          await api.toggleLanguage({ token: state.token, lang, enabled: true, force: true })
        } else {
          input.checked = false
          shell.setStatus('Activation cancelled -- translations are incomplete.', true)
          return
        }
      }
      await data.loadLanguages()
      render.renderLanguageSelectors()
      render.renderLanguagesTable()
      await onLanguagesChanged()
    } catch (error) {
      input.checked = !enabling
      shell.setStatus(error.message, true)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────

  const handleLanguageDelete = async (lang) => {
    if (!window.confirm(`Delete language "${lang}"?`)) return
    try {
      await api.deleteLanguage({ token: state.token, lang })
      await data.loadLanguages()
      render.renderLanguageSelectors()
      render.renderLanguagesTable()
      await onLanguagesChanged()
      shell.setStatus(`Language "${lang}" deleted`, false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  // ── Events ─────────────────────────────────────────────────────

  const bindEvents = () => {
    view.addBtn.addEventListener('click', () => openModal(null))
    view.saveBtn.addEventListener('click', handleSave)
    bindModalClose(view.modal, closeModal, [view.cancelModalBtn, view.closeModalBtn])

    view.languagesBody.addEventListener('change', (event) => {
      const target = event.target
      if (target?.dataset?.action === 'lang-toggle') {
        handleLanguageToggle(target)
      }
    })

    view.languagesBody.addEventListener('click', (event) => {
      const editBtn = event.target.closest('[data-edit]')
      if (editBtn) {
        const lang = editBtn.dataset.edit
        const language = state.languages.find((l) => l.lang === lang)
        if (language) openModal(language)
        return
      }
      const deleteBtn = event.target.closest('[data-delete]')
      if (deleteBtn) {
        handleLanguageDelete(deleteBtn.dataset.delete)
      }
    })
  }

  return { bindEvents, loadLanguages }
}

/**
 * Content controller for managing content pages (e.g. about text).
 * Exports: createContentController.
 */
import { marked } from 'marked'
import { icons } from '../utils/dom'

export function createContentController({ state, views, api, shell }) {
  let activePageKey = 'about'
  let languages = []
  let contentByLang = {}

  const loadContent = async () => {
    shell.setStatus('Loading content...', false)
    try {
      // Load available languages
      const langs = await api.fetchLanguages({ token: state.token })
      languages = Array.isArray(langs) ? langs : []

      // Load content for active page key
      const entries = await api.fetchContent({ token: state.token, pageKey: activePageKey })
      contentByLang = {}
      if (Array.isArray(entries)) {
        entries.forEach((entry) => {
          contentByLang[entry.lang] = entry.body || ''
        })
      }

      renderEditors()
      shell.setStatus('Content loaded', false)
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const renderEditors = () => {
    const container = views.contentView.editorsContainer
    container.innerHTML = ''

    if (!languages.length) {
      container.innerHTML = '<p class="muted">No languages configured. Add languages first.</p>'
      return
    }

    languages.forEach((lang) => {
      const langCode = lang.lang || lang.id
      const label = lang.label || langCode.toUpperCase()
      const body = contentByLang[langCode] || ''

      const block = document.createElement('div')
      block.className = 'content-editor-block'

      const header = document.createElement('div')
      header.className = 'content-editor-header'
      header.innerHTML = `<h3>${label} <span class="muted">(${langCode})</span></h3>`

      const actions = document.createElement('div')
      actions.className = 'content-editor-actions'

      const previewToggle = document.createElement('button')
      previewToggle.type = 'button'
      previewToggle.className = 'ghost'
      previewToggle.textContent = 'Preview'
      previewToggle.title = 'Toggle Markdown preview'

      const saveButton = document.createElement('button')
      saveButton.type = 'button'
      saveButton.className = 'btn-save'
      saveButton.innerHTML = `${icons.save} Save`
      saveButton.title = `Save ${label} content`

      actions.appendChild(previewToggle)
      actions.appendChild(saveButton)
      header.appendChild(actions)

      const textarea = document.createElement('textarea')
      textarea.className = 'content-textarea'
      textarea.value = body
      textarea.placeholder = `Markdown content for ${label}...`
      textarea.rows = 12

      const preview = document.createElement('div')
      preview.className = 'content-preview about-content'
      preview.style.display = 'none'

      block.appendChild(header)
      block.appendChild(textarea)
      block.appendChild(preview)
      container.appendChild(block)

      previewToggle.addEventListener('click', () => {
        const showing = preview.style.display !== 'none'
        if (showing) {
          preview.style.display = 'none'
          textarea.style.display = ''
          previewToggle.textContent = 'Preview'
        } else {
          const processed = (textarea.value || '').replace(/\{\{year\}\}/g, String(new Date().getFullYear()))
          preview.innerHTML = marked.parse(processed)
          preview.style.display = ''
          textarea.style.display = 'none'
          previewToggle.textContent = 'Edit'
        }
      })

      saveButton.addEventListener('click', async () => {
        try {
          shell.setStatus(`Saving ${label}...`, false)
          await api.upsertContent({
            token: state.token,
            pageKey: activePageKey,
            lang: langCode,
            body: textarea.value,
          })
          contentByLang[langCode] = textarea.value
          shell.setStatus(`${label} content saved`, false)
        } catch (error) {
          shell.setStatus(error.message, true)
        }
      })
    })
  }

  const bindEvents = () => {
    views.contentView.reloadButton.addEventListener('click', () => loadContent())
  }

  return { bindEvents, loadContent }
}

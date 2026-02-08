/**
 * Audit controller orchestrates audit loader and renderer.
 * Exports: createAuditController.
 */
import { createAuditLoader } from './audit/loader'
import { createAuditRenderer } from './audit/renderer'

export function createAuditController({ state, views, api, shell }) {
  const loader = createAuditLoader({ state, api })
  const renderer = createAuditRenderer({ state, views })

  const loadAuditLogs = async () => {
    try {
      await loader.loadAuditLogs()
      renderer.renderAuditLogs()
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  const bindEvents = () => {
    const {
      reloadAuditButton,
      auditLimitSelect,
      auditFirstButton,
      auditPrevButton,
      auditNextButton,
      auditLastButton,
    } = views.auditView
    reloadAuditButton.addEventListener('click', () => loadAuditLogs())
    auditLimitSelect.addEventListener('change', (event) => {
      state.audit.limit = Number(event.target.value)
      state.audit.offset = 0
      loadAuditLogs()
    })
    auditFirstButton.addEventListener('click', () => {
      state.audit.offset = 0
      loadAuditLogs()
    })
    auditPrevButton.addEventListener('click', () => {
      state.audit.offset = Math.max(0, state.audit.offset - state.audit.limit)
      loadAuditLogs()
    })
    auditNextButton.addEventListener('click', () => {
      state.audit.offset += state.audit.limit
      loadAuditLogs()
    })
    auditLastButton.addEventListener('click', () => {
      const maxPage = Math.max(1, Math.ceil((state.audit.total || 0) / state.audit.limit))
      state.audit.offset = (maxPage - 1) * state.audit.limit
      loadAuditLogs()
    })
  }

  return { bindEvents, loadAuditLogs }
}

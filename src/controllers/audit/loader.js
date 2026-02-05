/**
 * Audit loader for fetching audit logs.
 * Exports: createAuditLoader.
 */
export function createAuditLoader({ state, api }) {
  const loadAuditLogs = async () => {
    const result = await api.fetchAuditLogs({
      token: state.token,
      limit: state.audit.limit,
      offset: state.audit.offset,
    })
    state.audit.items = result.items || []
    state.audit.total = result.total || 0
    state.audit.limit = result.limit || state.audit.limit
    state.audit.offset = result.offset || state.audit.offset
  }

  return { loadAuditLogs }
}

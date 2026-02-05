/**
 * Layout builder for the admin app shell containers.
 * Exports: createLayout.
 */
export function createLayout() {
  const layout = document.createElement('div')
  layout.className = 'layout'

  const status = document.createElement('div')
  status.className = 'status'

  const pages = document.createElement('div')
  pages.className = 'pages'

  return { layout, status, pages }
}

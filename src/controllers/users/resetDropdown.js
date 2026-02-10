/**
 * Floating reset dropdown that escapes parent overflow containers.
 * Single responsibility: dropdown rendering and positioning.
 * Exports: createResetDropdown.
 */

const EXPIRY_OPTIONS = [
  { hours: 1, label: '1 hour' },
  { hours: 24, label: '24 hours' },
  { hours: 168, label: '7 days' },
  { hours: 720, label: '30 days' },
]

export function createResetDropdown() {
  let currentUserId = null
  let selectedHoursMap = new Map()
  let onCopyLink = null
  let onSelectExpiry = null

  /* ── Build the floating element ── */

  const el = document.createElement('div')
  el.className = 'reset-dropdown-float'
  el.innerHTML = `
    <div class="reset-dropdown-label muted">Validity</div>
    ${EXPIRY_OPTIONS.map(
      (opt) =>
        `<button data-expiry="${opt.hours}" class="${opt.hours === 24 ? 'is-active' : ''}">${opt.label}</button>`
    ).join('')}
    <div class="reset-dropdown-divider"></div>
    <button data-action="copy-link" class="reset-dropdown-fallback">Show reset link</button>
  `
  document.body.appendChild(el)

  /* ── Event handling ── */

  el.addEventListener('click', (e) => {
    e.stopPropagation()
    const expiryBtn = e.target.closest('button[data-expiry]')
    if (expiryBtn) {
      const hours = Number(expiryBtn.dataset.expiry)
      if (currentUserId) selectedHoursMap.set(currentUserId, hours)
      el.querySelectorAll('button[data-expiry]').forEach((btn) => {
        btn.classList.toggle('is-active', Number(btn.dataset.expiry) === hours)
      })
      if (onSelectExpiry) onSelectExpiry(currentUserId, hours)
      return
    }
    const copyBtn = e.target.closest('button[data-action="copy-link"]')
    if (copyBtn && currentUserId && onCopyLink) {
      const userId = currentUserId
      close()
      onCopyLink(userId)
    }
  })

  document.addEventListener('click', () => close())

  /* ── Public API ── */

  const open = (anchorButton, userId) => {
    currentUserId = userId
    const hours = selectedHoursMap.get(userId) || 24
    el.querySelectorAll('button[data-expiry]').forEach((btn) => {
      btn.classList.toggle('is-active', Number(btn.dataset.expiry) === hours)
    })

    const rect = anchorButton.getBoundingClientRect()
    el.style.top = `${rect.bottom + 4}px`
    el.style.left = ''
    el.style.right = ''

    /* Position from right edge if close to viewport edge */
    const rightSpace = window.innerWidth - rect.right
    if (rightSpace < 200) {
      el.style.right = `${window.innerWidth - rect.right}px`
    } else {
      el.style.left = `${rect.left}px`
    }

    el.classList.add('is-open')
  }

  const close = () => {
    el.classList.remove('is-open')
    currentUserId = null
  }

  const isOpen = () => el.classList.contains('is-open')

  const getSelectedHours = (userId) => selectedHoursMap.get(userId) || 24

  const setCallbacks = ({ onCopyLink: copyFn, onSelectExpiry: expiryFn }) => {
    onCopyLink = copyFn
    onSelectExpiry = expiryFn
  }

  return { open, close, isOpen, getSelectedHours, setCallbacks, element: el }
}

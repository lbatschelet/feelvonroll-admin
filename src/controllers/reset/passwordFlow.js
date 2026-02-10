/**
 * Reset password flow: token + new password → set_password API call.
 * Exports: createResetPasswordFlow.
 */
export function createResetPasswordFlow({ api, views }) {
  const { newPassword, confirmPassword, passwordMatch, setPasswordButton, setStatus: statusEl } = views.resetPage

  const setStatus = (message, isError) => {
    statusEl.textContent = message
    statusEl.classList.toggle('error', Boolean(isError))
  }

  const updateMatchIndicator = () => {
    const pw = newPassword.value
    const confirm = confirmPassword.value

    if (!pw && !confirm) {
      passwordMatch.textContent = ''
      passwordMatch.className = 'password-match'
      return
    }
    if (!confirm) {
      passwordMatch.textContent = ''
      passwordMatch.className = 'password-match'
      return
    }
    if (pw === confirm) {
      if (pw.length < 8) {
        passwordMatch.textContent = 'Too short (min. 8 characters)'
        passwordMatch.className = 'password-match is-error'
      } else {
        passwordMatch.textContent = 'Passwords match'
        passwordMatch.className = 'password-match is-ok'
      }
    } else {
      passwordMatch.textContent = 'Passwords don\u2019t match'
      passwordMatch.className = 'password-match is-error'
    }
  }

  const handleSetPassword = async () => {
    const token = new URLSearchParams(window.location.search).get('token') || ''
    const password = newPassword.value
    const confirm = confirmPassword.value

    if (!token) {
      setStatus('Missing reset token.', true)
      return
    }
    if (!password || password.length < 8) {
      setStatus('Password must be at least 8 characters.', true)
      return
    }
    if (password !== confirm) {
      setStatus('Passwords do not match.', true)
      return
    }

    setPasswordButton.disabled = true
    setPasswordButton.textContent = 'Saving...'
    try {
      await api.setPassword({ reset_token: token, password })
      newPassword.value = ''
      confirmPassword.value = ''
      passwordMatch.textContent = ''
      passwordMatch.className = 'password-match'
      setStatus('Password set successfully. You can now log in.', false)
      setPasswordButton.textContent = 'Done'
    } catch (error) {
      setStatus(error.message, true)
      setPasswordButton.disabled = false
      setPasswordButton.textContent = 'Set password'
    }
  }

  const bindEvents = () => {
    setPasswordButton.addEventListener('click', handleSetPassword)
    newPassword.addEventListener('input', updateMatchIndicator)
    confirmPassword.addEventListener('input', updateMatchIndicator)
    confirmPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSetPassword()
    })
  }

  return { bindEvents }
}

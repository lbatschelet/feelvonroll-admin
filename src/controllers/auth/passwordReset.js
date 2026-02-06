/**
 * Password reset flow for setting a new password.
 * Exports: createPasswordResetFlow.
 */
export function createPasswordResetFlow({ api, shell, views }) {
  const { resetTokenInput, resetPasswordInput } = views.loginCard

  const handleSetPassword = async () => {
    const resetToken = resetTokenInput.value.trim()
    const password = resetPasswordInput.value
    if (!resetToken || !password) {
      shell.setStatus('Reset token and password are required', true)
      return
    }
    try {
      await api.setPassword({ reset_token: resetToken, password })
      resetTokenInput.value = ''
      resetPasswordInput.value = ''
      shell.setStatus('Password set. Please log in.', false)
      const url = new URL(window.location.href)
      url.searchParams.delete('reset_token')
      window.history.replaceState({}, '', url.toString())
      shell.setAuthSection('login')
    } catch (error) {
      shell.setStatus(error.message, true)
    }
  }

  return { handleSetPassword }
}

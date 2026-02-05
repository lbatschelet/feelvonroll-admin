/**
 * Users loader for fetching admin users.
 * Exports: createUsersLoader.
 */
export function createUsersLoader({ state, api }) {
  const loadUsers = async () => {
    state.users = await api.fetchUsers({ token: state.token })
    return state.users
  }

  return { loadUsers }
}

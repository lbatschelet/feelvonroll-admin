/**
 * Users view builder for user list and actions.
 * Exports: createUsersView.
 */
export function createUsersView() {
  const usersCard = document.createElement('section')
  usersCard.className = 'card users-card'
  usersCard.innerHTML = `
    <div class="card-header">
      <h2>Users</h2>
      <button id="reloadUsers" class="ghost" title="Reload users list">Reload</button>
    </div>
    <div class="user-actions">
      <button type="button" id="addUser" title="Create a new user">Create user</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First name</th>
            <th>Last name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Password</th>
            <th>Last login</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="usersBody"></tbody>
      </table>
    </div>
    <div class="reset-link" id="resetLinkBox"></div>
  `

  return {
    element: usersCard,
    reloadUsersButton: usersCard.querySelector('#reloadUsers'),
    addUserButton: usersCard.querySelector('#addUser'),
    usersBody: usersCard.querySelector('#usersBody'),
    resetLinkBox: usersCard.querySelector('#resetLinkBox'),
  }
}

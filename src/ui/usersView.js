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
      <div class="header-actions">
        <button type="button" id="addUser" title="Create a new user">Create user</button>
      </div>
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
            <th></th>
          </tr>
        </thead>
        <tbody id="usersBody"></tbody>
      </table>
    </div>
  `

  return {
    element: usersCard,
    addUserButton: usersCard.querySelector('#addUser'),
    usersBody: usersCard.querySelector('#usersBody'),
  }
}

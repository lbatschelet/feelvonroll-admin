/**
 * Users view builder for user list and actions.
 * Exports: createUsersView.
 */
export function createUsersView() {
  const usersCard = document.createElement('section')
  usersCard.className = 'card users-card'
  usersCard.innerHTML = `
    <div class="card-header">
      <h2>User</h2>
      <button id="reloadUsers" class="ghost">Neu laden</button>
    </div>
    <div class="user-actions">
      <button type="button" id="addUser">User erstellen</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vorname</th>
            <th>Nachname</th>
            <th>Email</th>
            <th>Rolle</th>
            <th>Passwort</th>
            <th>Letzter Login</th>
            <th>Aktion</th>
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

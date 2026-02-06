/**
 * Header builder with navigation buttons.
 * Exports: createHeader.
 */
export function createHeader() {
  const header = document.createElement('header')
  header.className = 'header'
  header.innerHTML = `
    <div class="header-title" data-action="dashboard" role="button" tabindex="0">
      <h1>Feelvonroll Admin</h1>
      <p>Manage pins and approvals</p>
    </div>
    <nav class="nav">
      <button class="nav-button" data-page="pins">Pins</button>
      <button class="nav-button" data-page="questionnaire">Questionnaire</button>
      <button class="nav-button" data-page="languages">Languages</button>
      <button class="nav-button" data-page="users" data-admin-only="true">Users</button>
      <button class="nav-button" data-page="audit" data-admin-only="true">Audit</button>
    </nav>
    <div class="user-menu">
      <button class="nav-button ghost" id="userMenuButton" type="button">Profile</button>
      <div class="user-menu-panel" id="userMenuPanel">
        <button type="button" data-action="profile">Edit profile</button>
        <button type="button" data-action="logout">Log out</button>
      </div>
    </div>
  `

  return {
    element: header,
    titleButton: header.querySelector('.header-title'),
    nav: header.querySelector('.nav'),
    navButtons: Array.from(header.querySelectorAll('.nav-button[data-page]')),
    userMenuButton: header.querySelector('#userMenuButton'),
    userMenuPanel: header.querySelector('#userMenuPanel'),
    userMenuItems: Array.from(header.querySelectorAll('#userMenuPanel button')),
  }
}

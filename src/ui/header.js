/**
 * Header builder with navigation buttons.
 * Exports: createHeader.
 */
export function createHeader() {
  const header = document.createElement('header')
  header.className = 'header'
  header.innerHTML = `
    <div class="header-brand">
      <a class="header-title" data-action="dashboard" href="#" title="Go to dashboard"><em>feel</em><strong>vonRoll</strong> Admin</a>
      <a class="header-external" href="https://feelvonroll.ch" target="_blank" rel="noopener" title="Open feelvonRoll.ch">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
    </div>
    <nav class="nav">
      <button class="nav-button" data-page="pins">Pins</button>
      <button class="nav-button" data-page="questionnaire">Questionnaire</button>
      <button class="nav-button" data-page="languages">Languages</button>
      <button class="nav-button" data-page="users" data-admin-only="true">Users</button>
      <button class="nav-button" data-page="audit" data-admin-only="true">Audit</button>
      <button class="nav-button" data-page="content">Content</button>
      <div class="user-menu">
        <button class="nav-button" id="userMenuButton" type="button">Profile</button>
        <div class="user-menu-panel" id="userMenuPanel">
          <button type="button" data-action="profile">Edit profile</button>
          <button type="button" data-action="logout">Log out</button>
        </div>
      </div>
    </nav>
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

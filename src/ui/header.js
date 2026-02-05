/**
 * Header builder with navigation buttons.
 * Exports: createHeader.
 */
export function createHeader() {
  const header = document.createElement('header')
  header.className = 'header'
  header.innerHTML = `
    <div>
      <h1>Feelvonroll Admin</h1>
      <p>Verwalte Pins und Freigaben</p>
    </div>
    <nav class="nav">
      <button class="nav-button" data-page="dashboard">Übersicht</button>
      <button class="nav-button" data-page="pins">Pins</button>
      <button class="nav-button" data-page="questionnaire">Fragebogen</button>
      <button class="nav-button" data-page="users">User</button>
      <button class="nav-button" data-page="audit">Audit</button>
      <button class="nav-button ghost" data-action="logout">Logout</button>
    </nav>
  `

  return {
    element: header,
    nav: header.querySelector('.nav'),
    navButtons: Array.from(header.querySelectorAll('.nav-button')),
  }
}

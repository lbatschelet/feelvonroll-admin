/**
 * Dashboard card builder for overview metrics.
 * Exports: createDashboardCard.
 */
export function createDashboardCard() {
  const dashboardCard = document.createElement('section')
  dashboardCard.className = 'card dashboard-card'
  dashboardCard.innerHTML = `
    <div class="card-header">
      <h2>Übersicht</h2>
    </div>
    <div class="dashboard-grid">
      <div class="dashboard-item">
        <span class="muted">Pins gesamt</span>
        <strong id="dashboardPinsTotal">0</strong>
      </div>
      <div class="dashboard-item">
        <span class="muted">Pins wartend</span>
        <strong id="dashboardPinsPending">0</strong>
      </div>
      <div class="dashboard-item">
        <span class="muted">Pins freigegeben</span>
        <strong id="dashboardPinsApproved">0</strong>
      </div>
      <div class="dashboard-item">
        <span class="muted">Pins abgelehnt</span>
        <strong id="dashboardPinsRejected">0</strong>
      </div>
      <div class="dashboard-item">
        <span class="muted">Fragen</span>
        <strong id="dashboardQuestionsTotal">0</strong>
      </div>
      <div class="dashboard-item">
        <span class="muted">Aktive Sprachen</span>
        <strong id="dashboardLanguagesActive">0</strong>
      </div>
    </div>
  `

  return {
    element: dashboardCard,
    dashboardPinsTotal: dashboardCard.querySelector('#dashboardPinsTotal'),
    dashboardPinsPending: dashboardCard.querySelector('#dashboardPinsPending'),
    dashboardPinsApproved: dashboardCard.querySelector('#dashboardPinsApproved'),
    dashboardPinsRejected: dashboardCard.querySelector('#dashboardPinsRejected'),
    dashboardQuestionsTotal: dashboardCard.querySelector('#dashboardQuestionsTotal'),
    dashboardLanguagesActive: dashboardCard.querySelector('#dashboardLanguagesActive'),
  }
}

/**
 * Dashboard card builder for overview metrics.
 * Exports: createDashboardCard.
 */
export function createDashboardCard() {
  const dashboardCard = document.createElement('section')
  dashboardCard.className = 'card dashboard-card'
  dashboardCard.innerHTML = `
    <div class="card-header">
      <h2>Overview</h2>
    </div>
    <div class="dashboard-grid">
      <div class="dashboard-item">
        <span class="muted">Total pins</span>
        <strong id="dashboardPinsTotal">0</strong>
      </div>
      <div class="dashboard-item">
        <span class="muted">Pending pins</span>
        <strong id="dashboardPinsPending">0</strong>
      </div>
      <div class="dashboard-item">
        <span class="muted">Approved pins</span>
        <strong id="dashboardPinsApproved">0</strong>
      </div>
      <div class="dashboard-item">
        <span class="muted">Rejected pins</span>
        <strong id="dashboardPinsRejected">0</strong>
      </div>
      <div class="dashboard-item">
        <span class="muted">Questions</span>
        <strong id="dashboardQuestionsTotal">0</strong>
      </div>
      <div class="dashboard-item">
        <span class="muted">Active languages</span>
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

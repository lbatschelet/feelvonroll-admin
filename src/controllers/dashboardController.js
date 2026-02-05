/**
 * Dashboard controller renders overview metrics.
 * Exports: createDashboardController.
 */
import { getActiveLanguages } from '../services/languagesService'

export function createDashboardController({ state, views }) {
  const { dashboard } = views

  const renderDashboard = () => {
    dashboard.dashboardPinsTotal.textContent = String(state.pins.length)
    dashboard.dashboardPinsPending.textContent = String(
      state.pins.filter((pin) => pin.approved === 0).length
    )
    dashboard.dashboardPinsApproved.textContent = String(
      state.pins.filter((pin) => pin.approved === 1).length
    )
    dashboard.dashboardPinsRejected.textContent = String(
      state.pins.filter((pin) => pin.approved === -1).length
    )
    dashboard.dashboardQuestionsTotal.textContent = String(state.questions.length)
    dashboard.dashboardLanguagesActive.textContent = String(getActiveLanguages(state.languages).length)
  }

  return { renderDashboard }
}

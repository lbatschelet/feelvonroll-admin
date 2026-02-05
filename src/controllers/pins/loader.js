/**
 * Pins loader for fetching and normalizing pin data.
 * Exports: createPinsLoader.
 */
export function createPinsLoader({ state, api }) {
  const normalizePin = (pin) => ({
    ...pin,
    id: Number(pin.id),
    floor_index: Number(pin.floor_index),
    position_x: Number(pin.position_x),
    position_y: Number(pin.position_y),
    position_z: Number(pin.position_z),
    wellbeing: Number(pin.wellbeing),
    approved: Number(pin.approved),
    group_key: pin.group_key || null,
  })

  const loadPins = async () => {
    const rawPins = await api.fetchAdminPins({ token: state.token })
    state.pins = rawPins.map(normalizePin)
    return state.pins
  }

  return { loadPins }
}

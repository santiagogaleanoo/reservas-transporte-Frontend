export function clasificar(reserva) {
  const salida = reserva.tiquetes[0]?.fechaHoraSalida
  const futuro = salida && new Date(salida) > new Date()
  if (reserva.estado === 'CANCELADA' || reserva.estado === 'VENCIDA') return 'canceladas'
  if (reserva.estado === 'PENDIENTE') return futuro ? 'pendientes' : 'canceladas'
  return futuro ? 'proximos' : 'anteriores'
}

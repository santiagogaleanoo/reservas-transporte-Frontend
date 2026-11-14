export function aConsulta({ origen, destino, fecha, pasajeros, tipo, flexible }) {
  const consulta = new URLSearchParams()
  consulta.set('origen', origen)
  consulta.set('destino', destino)
  if (fecha && !flexible) consulta.set('fecha', fecha)
  consulta.set('pasajeros', pasajeros ?? 1)
  if (tipo) consulta.set('tipo', tipo)
  return consulta.toString()
}

const CLAVE_VIAJE = 'reservas.viaje.'

export function recordarViaje(viaje, consulta) {
  try {
    sessionStorage.setItem(CLAVE_VIAJE + viaje.codViaje, JSON.stringify({ viaje, consulta }))
  } catch {
    return
  }
}

export function viajeRecordado(codViaje) {
  try {
    const texto = sessionStorage.getItem(CLAVE_VIAJE + codViaje)
    return texto ? JSON.parse(texto) : null
  } catch {
    return null
  }
}

export const FRANJAS = [
  { clave: 'madrugada', texto: 'Madrugada', rango: '00:00 – 05:59', desde: 0, hasta: 6 },
  { clave: 'manana', texto: 'Mañana', rango: '06:00 – 11:59', desde: 6, hasta: 12 },
  { clave: 'tarde', texto: 'Tarde', rango: '12:00 – 17:59', desde: 12, hasta: 18 },
  { clave: 'noche', texto: 'Noche', rango: '18:00 – 23:59', desde: 18, hasta: 24 },
]

export function franjaDe(fechaHora) {
  const horaSalida = new Date(fechaHora).getHours()
  return FRANJAS.find((franja) => horaSalida >= franja.desde && horaSalida < franja.hasta)?.clave
}

export function precioDesde(viaje) {
  return Math.min(...viaje.clases.map((clase) => clase.precioTotal))
}

export function cuposTotales(viaje) {
  return viaje.clases.reduce((suma, clase) => suma + clase.cuposDisponibles, 0)
}

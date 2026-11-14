const moneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const numero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })

export function aFecha(valor) {
  if (!valor) return null
  if (valor instanceof Date) return valor
  const texto = String(valor)
  return new Date(texto.length === 10 ? `${texto}T00:00:00` : texto)
}

export function dinero(valor) {
  if (valor === null || valor === undefined || valor === '') return '—'
  return moneda.format(Number(valor))
}

export function cifra(valor) {
  if (valor === null || valor === undefined || valor === '') return '—'
  return numero.format(Number(valor))
}

export function fecha(valor, opciones = {}) {
  const dato = aFecha(valor)
  if (!dato) return '—'
  return capitalizar(dato.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', ...opciones }))
}

export function capitalizar(texto) {
  if (!texto) return texto
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function fechaCorta(valor) {
  const dato = aFecha(valor)
  if (!dato) return '—'
  return dato.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function hora(valor) {
  const dato = aFecha(valor)
  if (!dato) return '—'
  return dato.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function fechaHora(valor) {
  const dato = aFecha(valor)
  if (!dato) return '—'
  return `${fechaCorta(dato)} ${hora(dato)}`
}

export function duracion(minutos) {
  if (minutos === null || minutos === undefined) return '—'
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (!horas) return `${resto} min`
  return resto ? `${horas} h ${resto} min` : `${horas} h`
}

export function aIsoLocal(dato) {
  const anio = dato.getFullYear()
  const mes = String(dato.getMonth() + 1).padStart(2, '0')
  const dia = String(dato.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

export function hoyIso() {
  return aIsoLocal(new Date())
}

export function sumarDias(iso, dias) {
  const dato = aFecha(iso)
  dato.setDate(dato.getDate() + dias)
  return aIsoLocal(dato)
}

export function diasEntre(desde, hasta) {
  return Math.round((aFecha(hasta) - aFecha(desde)) / 86400000)
}

export function aDatetimeLocal(valor) {
  if (!valor) return ''
  return String(valor).slice(0, 16)
}

export function desdeDatetimeLocal(valor) {
  if (!valor) return null
  return valor.length === 16 ? `${valor}:00` : valor
}

export function falta(valor) {
  const dato = aFecha(valor)
  if (!dato) return ''
  const minutos = Math.round((dato - new Date()) / 60000)
  if (minutos <= 0) return 'ya pasó'
  if (minutos < 60) return `en ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 48) return `en ${horas} h ${minutos % 60} min`
  return `en ${Math.floor(horas / 24)} días`
}

const NOMBRES = {
  ECONOMICA: 'Económica',
  EJECUTIVA: 'Ejecutiva',
  PREFERENCIAL: 'Preferencial',
  AEREO: 'Aéreo',
  TERRESTRE: 'Terrestre',
  ADULTO: 'Adulto',
  NINO: 'Niño',
  INFANTE: 'Infante',
  MANO: 'De mano',
  BODEGA: 'De bodega',
  ESPECIAL: 'Especial',
  WEB: 'Web',
  APP_MOVIL: 'App móvil',
  AGENCIA: 'Agencia',
  TAQUILLA: 'Taquilla',
  MOSTRADOR: 'Mostrador',
  KIOSCO: 'Kiosco',
  EN_CURSO: 'En curso',
  TARJETA_CREDITO: 'Tarjeta de crédito',
  TARJETA_DEBITO: 'Tarjeta débito',
  PSE: 'PSE',
  RECORDATORIO_VIAJE: 'Recordatorio de viaje',
  PROMOCION: 'Promoción',
  CAMBIO_VIAJE: 'Cambio de viaje',
  CONFIRMACION_PAGO: 'Pago confirmado',
  RESERVA_PENDIENTE: 'Reserva pendiente',
  RESERVA_CANCELADA: 'Reserva cancelada',
  RESERVA_VENCIDA: 'Reserva vencida',
  CHECKIN: 'Check-in',
  ASESOR_VENTAS: 'Asesor de ventas',
  AGENTE_CHECKIN: 'Agente de check-in',
  VENTANA: 'Ventana',
  PASILLO: 'Pasillo',
  CENTRO: 'Centro',
}

export function legible(valor) {
  if (valor === null || valor === undefined || valor === '') return '—'
  const texto = String(valor)
  if (NOMBRES[texto]) return NOMBRES[texto]
  if (!/^[A-Z0-9_]+$/.test(texto)) return texto
  const minusculas = texto.replaceAll('_', ' ').toLowerCase()
  return minusculas.charAt(0).toUpperCase() + minusculas.slice(1)
}

export function nombreCompleto(persona) {
  if (!persona) return '—'
  return [persona.primerNombre, persona.segundoNombre, persona.primerApellido, persona.segundoApellido]
    .filter(Boolean)
    .join(' ')
}

export function sinTildes(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export const APERTURA_CHECKIN_HORAS = 48
export const MINIMO_SIN_PAGO_HORAS = 3
export const PLAZO_PAGO_HORAS = 24
export const PAGO_ANTES_SALIDA_HORAS = 2

export const EQUIPAJE = {
  maximoManoKg: 10,
  limitePiezaKg: 23,
  maximoPiezaKg: 32,
  costoPiezaAdicional: 95000,
  costoPiezaEspecial: 120000,
  costoKgExceso: 8000,
  maximoDespachadas: 3,
}

function exceso(peso, limite) {
  const sobra = peso - limite
  return sobra <= 0 ? 0 : Math.ceil(sobra) * EQUIPAJE.costoKgExceso
}

export function estimarEquipaje(actuales, nuevas, incluidoKg) {
  let deMano = actuales.filter((pieza) => pieza.tipo === 'MANO').length
  let despachadas = actuales.length - deMano
  let incluidaUsada = Number(incluidoKg) === 0 || actuales.some((pieza) => pieza.tipo === 'BODEGA')
  const detalle = []
  let total = 0
  let error = null
  nuevas.forEach((pieza, posicion) => {
    const peso = Number(pieza.pesoKg)
    let costo = 0
    let nota = ''
    if (!peso || peso <= 0) {
      error = error ?? `Indica el peso de la pieza ${posicion + 1}`
    } else if (pieza.tipo === 'MANO') {
      deMano += 1
      if (peso > EQUIPAJE.maximoManoKg) error = error ?? `El equipaje de mano puede pesar hasta ${EQUIPAJE.maximoManoKg} kg`
      if (deMano > 1) error = error ?? 'Cada pasajero puede llevar una sola pieza de equipaje de mano'
      nota = 'Sin costo'
    } else {
      despachadas += 1
      if (peso > EQUIPAJE.maximoPiezaKg) error = error ?? `Ninguna pieza puede pesar más de ${EQUIPAJE.maximoPiezaKg} kg`
      if (despachadas > EQUIPAJE.maximoDespachadas) error = error ?? `Cada pasajero puede despachar hasta ${EQUIPAJE.maximoDespachadas} piezas de bodega o especiales`
      if (pieza.tipo === 'BODEGA' && !incluidaUsada) {
        costo = exceso(peso, Number(incluidoKg))
        incluidaUsada = true
        nota = costo ? `Incluida hasta ${incluidoKg} kg, exceso de ${Math.ceil(peso - Number(incluidoKg))} kg` : `Incluida en tu tarifa (hasta ${incluidoKg} kg)`
      } else {
        const base = pieza.tipo === 'ESPECIAL' ? EQUIPAJE.costoPiezaEspecial : EQUIPAJE.costoPiezaAdicional
        costo = base + exceso(peso, EQUIPAJE.limitePiezaKg)
        nota = pieza.tipo === 'ESPECIAL' ? 'Pieza especial' : 'Pieza adicional'
        if (peso > EQUIPAJE.limitePiezaKg) nota += `, exceso de ${Math.ceil(peso - EQUIPAJE.limitePiezaKg)} kg`
      }
    }
    detalle.push({ costo, nota })
    total += costo
  })
  return { detalle, total, error }
}

export function edadEn(fechaNacimiento, fechaViaje) {
  if (!fechaNacimiento) return null
  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`)
  const viaje = new Date(fechaViaje)
  let edad = viaje.getFullYear() - nacimiento.getFullYear()
  const mes = viaje.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && viaje.getDate() < nacimiento.getDate())) edad -= 1
  return edad
}

export function tipoSegunEdad(fechaNacimiento, fechaViaje) {
  const edad = edadEn(fechaNacimiento, fechaViaje)
  if (edad === null) return null
  if (edad < 2) return 'INFANTE'
  return edad < 12 ? 'NINO' : 'ADULTO'
}

export function limitePagoEstimado(salida) {
  const ahora = Date.now()
  const plazo = ahora + PLAZO_PAGO_HORAS * 3600000
  const antesDeSalir = new Date(salida).getTime() - PAGO_ANTES_SALIDA_HORAS * 3600000
  return new Date(Math.min(plazo, antesDeSalir))
}

export function puedeReservarSinPago(salida) {
  return new Date(salida).getTime() - Date.now() > MINIMO_SIN_PAGO_HORAS * 3600000
}

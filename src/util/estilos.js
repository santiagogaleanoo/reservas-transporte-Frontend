const VARIANTES = {
  primario: 'bg-marca-600 text-white hover:bg-marca-700 focus-visible:outline-marca-600 shadow-sm',
  acento: 'bg-amber-400 text-noche-950 hover:bg-amber-300 focus-visible:outline-amber-500 shadow-sm',
  secundario: 'bg-white text-noche-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline-noche-500',
  oscuro: 'bg-noche-900 text-white hover:bg-noche-800 focus-visible:outline-noche-900',
  peligro: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600 shadow-sm',
  fantasma: 'text-noche-700 hover:bg-slate-100 focus-visible:outline-noche-500',
}

const TAMANOS = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

export function clasesBoton(variante = 'primario', tamano = 'md', extra = '') {
  return [
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors whitespace-nowrap',
    'focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTES[variante] ?? VARIANTES.primario,
    TAMANOS[tamano] ?? TAMANOS.md,
    extra,
  ].join(' ')
}

export const clasesEntrada =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-marca-500 disabled:bg-slate-100 disabled:text-slate-500'

const COLORES_ESTADO = {
  verde: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amarillo: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  rojo: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  gris: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  azul: 'bg-sky-50 text-sky-700 ring-sky-600/20',
}

const ESTADOS = {
  verde: ['PAGADA', 'APROBADO', 'EMITIDO', 'PROGRAMADO', 'ACTIVO', 'ACTIVA', 'ENVIADA', 'VIGENTE', 'CONFIRMADA'],
  amarillo: ['PENDIENTE', 'RETRASADO', 'MANTENIMIENTO', 'PROGRAMADA'],
  rojo: ['CANCELADA', 'CANCELADO', 'VENCIDA', 'RECHAZADO', 'ANULADO', 'FALLIDA', 'BLOQUEADO', 'INACTIVO', 'INACTIVA', 'PERDIDO'],
  gris: ['FINALIZADO', 'USADO', 'REEMBOLSADO', 'CAMBIADO', 'LEIDA', 'ENTREGADO'],
  azul: ['EN_CURSO', 'REGISTRADO', 'EMBARCADO'],
}

export function colorEstado(estado) {
  const texto = String(estado ?? '').toUpperCase()
  const color = Object.keys(ESTADOS).find((clave) => ESTADOS[clave].includes(texto)) ?? 'gris'
  return COLORES_ESTADO[color]
}

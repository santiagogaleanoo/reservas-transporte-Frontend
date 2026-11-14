import { useEffect, useId } from 'react'
import { Link } from 'react-router-dom'
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert, X } from 'lucide-react'
import { clasesBoton, clasesEntrada, colorEstado } from '../util/estilos'
import { legible } from '../util/formato'

export function Boton({ variante, tamano, cargando, icono: Icono, children, className = '', type = 'button', disabled, ...resto }) {
  return (
    <button type={type} className={clasesBoton(variante, tamano, className)} disabled={disabled || cargando} {...resto}>
      {cargando ? <LoaderCircle className="size-4 animate-spin" /> : Icono ? <Icono className="size-4" /> : null}
      {children}
    </button>
  )
}

export function BotonEnlace({ variante, tamano, icono: Icono, children, className = '', ...resto }) {
  return (
    <Link className={clasesBoton(variante, tamano, className)} {...resto}>
      {Icono ? <Icono className="size-4" /> : null}
      {children}
    </Link>
  )
}

export function Campo({ etiqueta, ayuda, error, children, className = '', requerido }) {
  return (
    <label className={`block ${className}`}>
      {etiqueta ? (
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
          {etiqueta}
          {requerido ? <span className="text-rose-500"> *</span> : null}
        </span>
      ) : null}
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span> : null}
      {!error && ayuda ? <span className="mt-1 block text-xs text-slate-500">{ayuda}</span> : null}
    </label>
  )
}

export function Entrada({ className = '', invalido, ...resto }) {
  return <input className={`${clasesEntrada} ${invalido ? 'ring-rose-400' : ''} ${className}`} {...resto} />
}

export function Selector({ className = '', invalido, children, ...resto }) {
  return (
    <select className={`${clasesEntrada} pr-8 ${invalido ? 'ring-rose-400' : ''} ${className}`} {...resto}>
      {children}
    </select>
  )
}

export function AreaTexto({ className = '', ...resto }) {
  return <textarea className={`${clasesEntrada} min-h-24 ${className}`} {...resto} />
}

export function Casilla({ etiqueta, className = '', ...resto }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 ${className}`}>
      <input type="checkbox" className="size-4 rounded border-slate-300 accent-marca-600" {...resto} />
      {etiqueta}
    </label>
  )
}

const AVISOS = {
  error: { clases: 'bg-rose-50 text-rose-800 ring-rose-200', Icono: CircleAlert },
  exito: { clases: 'bg-emerald-50 text-emerald-800 ring-emerald-200', Icono: CircleCheck },
  alerta: { clases: 'bg-amber-50 text-amber-900 ring-amber-200', Icono: TriangleAlert },
  info: { clases: 'bg-sky-50 text-sky-900 ring-sky-200', Icono: Info },
}

export function Aviso({ tipo = 'info', titulo, children, className = '', alCerrar }) {
  if (!children && !titulo) return null
  const { clases, Icono } = AVISOS[tipo] ?? AVISOS.info
  return (
    <div className={`aparecer flex gap-3 rounded-xl p-3 text-sm ring-1 ${clases} ${className}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <Icono className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        {titulo ? <p className="font-semibold">{titulo}</p> : null}
        {children ? <div className={titulo ? 'mt-0.5' : ''}>{children}</div> : null}
      </div>
      {alCerrar ? (
        <button type="button" onClick={alCerrar} className="shrink-0 opacity-60 hover:opacity-100" aria-label="Cerrar">
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

export function Cargando({ texto = 'Cargando…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-10 text-sm text-slate-500 ${className}`}>
      <LoaderCircle className="size-5 animate-spin text-marca-600" />
      {texto}
    </div>
  )
}

export function Insignia({ estado, texto, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${colorEstado(estado)} ${className}`}>
      {texto ?? legible(estado)}
    </span>
  )
}

export function Tarjeta({ children, className = '', ...resto }) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 ${className}`} {...resto}>
      {children}
    </div>
  )
}

export function Vacio({ icono: Icono, imagen, posicion = 'center', titulo, children, accion }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      {imagen ? (
        <img src={imagen} alt="" loading="lazy" decoding="async" className="mb-3 h-40 w-64 max-w-full rounded-2xl object-cover shadow-md ring-1 ring-black/5" style={{ objectPosition: posicion }} />
      ) : Icono ? (
        <span className="mb-1 rounded-full bg-slate-100 p-3 text-slate-500">
          <Icono className="size-6" />
        </span>
      ) : null}
      <p className="font-semibold text-slate-800">{titulo}</p>
      {children ? <div className="max-w-md text-sm text-slate-500">{children}</div> : null}
      {accion ? <div className="mt-3">{accion}</div> : null}
    </div>
  )
}

export function Modal({ abierto, titulo, alCerrar, children, pie, ancho = 'max-w-lg' }) {
  const id = useId()
  useEffect(() => {
    if (!abierto) return undefined
    const tecla = (evento) => {
      if (evento.key === 'Escape') alCerrar?.()
    }
    document.addEventListener('keydown', tecla)
    const desbordamiento = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', tecla)
      document.body.style.overflow = desbordamiento
    }
  }, [abierto, alCerrar])
  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-noche-950/50 p-0 sm:items-center sm:p-4" onMouseDown={(evento) => evento.target === evento.currentTarget && alCerrar?.()}>
      <div role="dialog" aria-modal="true" aria-labelledby={id} className={`aparecer flex max-h-[92vh] w-full ${ancho} flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl`}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 id={id} className="text-lg font-bold text-noche-900">
            {titulo}
          </h2>
          <button type="button" onClick={alCerrar} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>
        <div className="desplazable overflow-y-auto px-5 py-4">{children}</div>
        {pie ? <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-3">{pie}</div> : null}
      </div>
    </div>
  )
}

export function Paginador({ pagina, total, porPagina, alCambiar }) {
  const paginas = Math.max(1, Math.ceil(total / porPagina))
  if (paginas <= 1) return null
  return (
    <div className="flex items-center justify-between gap-3 px-1 py-3 text-sm text-slate-600">
      <span>
        {Math.min(total, (pagina - 1) * porPagina + 1)}–{Math.min(total, pagina * porPagina)} de {total}
      </span>
      <div className="flex gap-2">
        <Boton variante="secundario" tamano="sm" disabled={pagina <= 1} onClick={() => alCambiar(pagina - 1)}>
          Anterior
        </Boton>
        <Boton variante="secundario" tamano="sm" disabled={pagina >= paginas} onClick={() => alCambiar(pagina + 1)}>
          Siguiente
        </Boton>
      </div>
    </div>
  )
}

export function Titulo({ titulo, descripcion, acciones, className = '' }) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-noche-900">{titulo}</h1>
        {descripcion ? <p className="mt-1 text-sm text-slate-500">{descripcion}</p> : null}
      </div>
      {acciones ? <div className="flex flex-wrap gap-2">{acciones}</div> : null}
    </div>
  )
}

export function Dato({ etiqueta, children, className = '' }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-900">{children ?? '—'}</dd>
    </div>
  )
}

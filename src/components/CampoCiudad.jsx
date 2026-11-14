import { useMemo, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { sinTildes } from '../util/formato'

export default function CampoCiudad({ etiqueta, ciudades, terminales, valor, alCambiar, placeholder, icono: Icono = MapPin, excluir }) {
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(0)
  const entrada = useRef(null)

  const opciones = useMemo(() => {
    const porCiudad = new Map()
    terminales.forEach((terminal) => {
      const lista = porCiudad.get(terminal.ciudad.codCiudad) ?? []
      lista.push(terminal)
      porCiudad.set(terminal.ciudad.codCiudad, lista)
    })
    return ciudades
      .filter((ciudad) => porCiudad.has(ciudad.codCiudad))
      .map((ciudad) => ({ ...ciudad, terminales: porCiudad.get(ciudad.codCiudad) }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [ciudades, terminales])

  const seleccionada = opciones.find((ciudad) => ciudad.codCiudad === Number(valor))
  const filtro = sinTildes(texto)
  const visibles = opciones.filter((ciudad) => {
    if (excluir && ciudad.codCiudad === Number(excluir)) return false
    if (!filtro) return true
    const lugar = [ciudad.nombre, ciudad.departamento?.nombre, ...ciudad.terminales.map((terminal) => `${terminal.codigo} ${terminal.nombre}`)].join(' ')
    return sinTildes(lugar).includes(filtro)
  })

  const elegir = (ciudad) => {
    alCambiar(ciudad.codCiudad)
    setTexto('')
    setAbierto(false)
    entrada.current?.blur()
  }

  const teclas = (evento) => {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setAbierto(true)
      setActivo((posicion) => Math.min(visibles.length - 1, posicion + 1))
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setActivo((posicion) => Math.max(0, posicion - 1))
    } else if (evento.key === 'Enter' && abierto && visibles[activo]) {
      evento.preventDefault()
      elegir(visibles[activo])
    } else if (evento.key === 'Escape') {
      setAbierto(false)
    }
  }

  const codigos = (ciudad) => ciudad.terminales.map((terminal) => terminal.codigo).join(' · ')

  return (
    <div className="relative min-w-0 flex-1">
      <label className="flex h-full cursor-text items-center gap-3 rounded-xl bg-white px-4 py-2.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-marca-500">
        <Icono className="size-5 shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{etiqueta}</span>
          <input
            ref={entrada}
            value={abierto ? texto : seleccionada ? `${seleccionada.nombre} (${codigos(seleccionada)})` : ''}
            onChange={(evento) => {
              setTexto(evento.target.value)
              setActivo(0)
              setAbierto(true)
            }}
            onFocus={() => {
              setTexto('')
              setAbierto(true)
            }}
            onBlur={() => setTimeout(() => setAbierto(false), 150)}
            onKeyDown={teclas}
            placeholder={placeholder}
            className="w-full truncate border-0 bg-transparent p-0 text-[15px] font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0"
            role="combobox"
            aria-expanded={abierto}
            aria-label={etiqueta}
            autoComplete="off"
          />
        </span>
      </label>
      {abierto ? (
        <ul className="desplazable aparecer absolute left-0 right-0 z-40 mt-2 max-h-80 overflow-y-auto rounded-xl bg-white py-1 shadow-xl ring-1 ring-slate-200" role="listbox">
          {visibles.length === 0 ? <li className="px-4 py-3 text-sm text-slate-500">No hay ciudades con terminales que coincidan</li> : null}
          {visibles.map((ciudad, posicion) => (
            <li key={ciudad.codCiudad} role="option" aria-selected={posicion === activo}>
              <button
                type="button"
                onMouseDown={(evento) => evento.preventDefault()}
                onClick={() => elegir(ciudad)}
                onMouseEnter={() => setActivo(posicion)}
                className={`flex w-full items-start gap-3 px-4 py-2.5 text-left ${posicion === activo ? 'bg-marca-50' : ''}`}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-marca-600" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900">
                    {ciudad.nombre}, <span className="font-normal text-slate-500">{ciudad.departamento?.nombre}</span>
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {ciudad.terminales.map((terminal) => `${terminal.nombre} (${terminal.codigo})`).join(' · ')}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

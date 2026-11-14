import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, BusFront, CalendarDays, Minus, Plane, PlaneLanding, PlaneTakeoff, Plus, Search, Users } from 'lucide-react'
import CampoCiudad from './CampoCiudad'
import { useCatalogo } from '../api/catalogos'
import { hoyIso } from '../util/formato'
import { aConsulta } from '../util/busqueda'

const TIPOS = [
  { valor: '', texto: 'Todo', icono: Search },
  { valor: 'AEREO', texto: 'Vuelos', icono: Plane },
  { valor: 'TERRESTRE', texto: 'Buses', icono: BusFront },
]

export default function Buscador({ inicial = {}, compacto = false }) {
  const navegar = useNavigate()
  const ciudades = useCatalogo('/ciudades')
  const terminales = useCatalogo('/terminales')
  const [tipo, setTipo] = useState(inicial.tipo ?? '')
  const [origen, setOrigen] = useState(inicial.origen ?? '')
  const [destino, setDestino] = useState(inicial.destino ?? '')
  const [fecha, setFecha] = useState(inicial.fecha ?? '')
  const [flexible, setFlexible] = useState(inicial.flexible ?? !inicial.fecha)
  const [pasajeros, setPasajeros] = useState(Number(inicial.pasajeros ?? 1))
  const [error, setError] = useState('')

  const terminalesTipo = terminales.datos.filter((terminal) => !tipo || terminal.tipoTransporte?.nombre === tipo)

  const intercambiar = () => {
    setOrigen(destino)
    setDestino(origen)
  }

  const buscar = (evento) => {
    evento.preventDefault()
    if (!origen || !destino) {
      setError('Elige la ciudad de origen y la de destino')
      return
    }
    if (Number(origen) === Number(destino)) {
      setError('El origen y el destino deben ser distintos')
      return
    }
    if (!flexible && !fecha) {
      setError('Elige la fecha del viaje o marca fechas flexibles')
      return
    }
    setError('')
    navegar(`/buscar?${aConsulta({ origen, destino, fecha, pasajeros, tipo, flexible })}`)
  }

  return (
    <form onSubmit={buscar} className={compacto ? '' : 'rounded-2xl bg-noche-950/45 p-3 shadow-2xl ring-1 ring-white/20 backdrop-blur-md sm:p-4'}>
      {!compacto ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {TIPOS.map(({ valor, texto, icono: Icono }) => (
            <button
              key={texto}
              type="button"
              onClick={() => setTipo(valor)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                tipo === valor ? 'bg-white text-noche-900' : 'text-white hover:bg-white/15'
              }`}
            >
              <Icono className="size-4" />
              {texto}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
        <div className="relative flex flex-1 flex-col gap-2 sm:flex-row">
          <CampoCiudad
            etiqueta="Desde"
            ciudades={ciudades.datos}
            terminales={terminalesTipo}
            valor={origen}
            alCambiar={setOrigen}
            excluir={destino}
            placeholder="Ciudad de origen"
            icono={PlaneTakeoff}
          />
          <button
            type="button"
            onClick={intercambiar}
            className="absolute left-1/2 top-1/2 z-10 hidden size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-noche-700 shadow ring-1 ring-slate-200 hover:bg-slate-50 sm:grid"
            aria-label="Intercambiar origen y destino"
          >
            <ArrowLeftRight className="size-4" />
          </button>
          <CampoCiudad
            etiqueta="Hacia"
            ciudades={ciudades.datos}
            terminales={terminalesTipo}
            valor={destino}
            alCambiar={setDestino}
            excluir={origen}
            placeholder="Ciudad de destino"
            icono={PlaneLanding}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex min-w-48 flex-1 items-center gap-3 rounded-xl bg-white px-4 py-2.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-marca-500">
            <CalendarDays className="size-5 shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fecha de ida</span>
              {flexible ? (
                <button type="button" onClick={() => setFlexible(false)} className="text-left text-[15px] font-semibold text-slate-900">
                  Próximos 30 días
                </button>
              ) : (
                <input
                  type="date"
                  value={fecha}
                  min={hoyIso()}
                  onChange={(evento) => setFecha(evento.target.value)}
                  className="w-full border-0 bg-transparent p-0 text-[15px] font-semibold text-slate-900 focus:outline-none focus:ring-0"
                  aria-label="Fecha de ida"
                />
              )}
            </span>
          </label>
          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 ring-1 ring-slate-200">
            <Users className="size-5 shrink-0 text-slate-400" />
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Viajeros</span>
              <span className="flex items-center gap-2">
                <button type="button" onClick={() => setPasajeros((valor) => Math.max(1, valor - 1))} className="grid size-6 place-items-center rounded-full ring-1 ring-slate-300 hover:bg-slate-100 disabled:opacity-40" disabled={pasajeros <= 1} aria-label="Quitar viajero">
                  <Minus className="size-3" />
                </button>
                <span className="w-5 text-center text-[15px] font-semibold" aria-live="polite">
                  {pasajeros}
                </span>
                <button type="button" onClick={() => setPasajeros((valor) => Math.min(9, valor + 1))} className="grid size-6 place-items-center rounded-full ring-1 ring-slate-300 hover:bg-slate-100 disabled:opacity-40" disabled={pasajeros >= 9} aria-label="Agregar viajero">
                  <Plus className="size-3" />
                </button>
              </span>
            </span>
          </div>
          <button type="submit" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 text-base font-bold text-noche-950 shadow-sm hover:bg-amber-300 lg:h-auto">
            <Search className="size-5" />
            Buscar
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <label className={`inline-flex cursor-pointer items-center gap-2 text-sm ${compacto ? 'text-slate-600' : 'text-white'}`}>
          <input type="checkbox" checked={flexible} onChange={(evento) => setFlexible(evento.target.checked)} className="size-4 accent-amber-400" />
          Mis fechas son flexibles
        </label>
        {error ? <p className={`text-sm font-semibold ${compacto ? 'text-rose-600' : 'text-amber-200'}`}>{error}</p> : null}
      </div>
    </form>
  )
}

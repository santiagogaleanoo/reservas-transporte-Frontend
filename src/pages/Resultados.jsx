import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Briefcase, BusFront, ChevronDown, ChevronLeft, ChevronRight, Clock, Plane, RefreshCw, SlidersHorizontal, Undo2, X } from 'lucide-react'
import Buscador from '../components/Buscador'
import { Aviso, Boton, Cargando, Casilla, Insignia, Vacio } from '../components/ui'
import { compras } from '../api/servicios'
import { useCatalogo } from '../api/catalogos'
import { aFecha, aIsoLocal, cifra, dinero, duracion, fecha, hora, hoyIso, legible, sumarDias } from '../util/formato'
import { FRANJAS, aConsulta, franjaDe, precioDesde, recordarViaje } from '../util/busqueda'
import { useSesion } from '../sesion/contexto'
import { FOTO_SIN_RESULTADOS } from '../util/fotos'

const ORDENES = [
  { clave: 'recomendado', texto: 'Recomendado' },
  { clave: 'barato', texto: 'Más barato' },
  { clave: 'rapido', texto: 'Más rápido' },
  { clave: 'temprano', texto: 'Sale primero' },
]

const FILTROS_VACIOS = { tipos: [], empresas: [], clases: [], franjas: [], precioMax: null, duracionMax: null, reembolso: false, cambios: false }

function puntaje(viaje, minimoPrecio, minimoDuracion) {
  return precioDesde(viaje) / minimoPrecio + (0.6 * viaje.duracionMin) / minimoDuracion
}

function alternar(lista, valor) {
  return lista.includes(valor) ? lista.filter((elemento) => elemento !== valor) : [...lista, valor]
}

function GrupoFiltro({ titulo, children }) {
  const [abierto, setAbierto] = useState(true)
  return (
    <div className="border-b border-slate-200 py-4 last:border-0">
      <button type="button" onClick={() => setAbierto((valor) => !valor)} className="flex w-full items-center justify-between text-sm font-bold text-slate-900">
        {titulo}
        <ChevronDown className={`size-4 text-slate-400 transition ${abierto ? '' : '-rotate-90'}`} />
      </button>
      {abierto ? <div className="mt-3 space-y-2">{children}</div> : null}
    </div>
  )
}

function Filtros({ viajes, filtros, setFiltros, limites }) {
  const empresas = useMemo(() => {
    const mapa = new Map()
    viajes.forEach((viaje) => {
      const actual = mapa.get(viaje.empresa)
      const precio = precioDesde(viaje)
      mapa.set(viaje.empresa, { nombre: viaje.empresa, precio: actual ? Math.min(actual.precio, precio) : precio, cantidad: (actual?.cantidad ?? 0) + 1 })
    })
    return [...mapa.values()].sort((a, b) => a.precio - b.precio)
  }, [viajes])
  const clases = [...new Set(viajes.flatMap((viaje) => viaje.clases.map((clase) => clase.nombre)))]
  const tipos = [...new Set(viajes.map((viaje) => viaje.tipoTransporte))]
  const conteoFranja = (clave) => viajes.filter((viaje) => franjaDe(viaje.fechaHoraSalida) === clave).length
  const precioMax = filtros.precioMax ?? limites.precioMax
  const duracionMax = filtros.duracionMax ?? limites.duracionMax

  return (
    <div>
      {tipos.length > 1 ? (
        <GrupoFiltro titulo="Transporte">
          {tipos.map((tipo) => (
            <Casilla key={tipo} etiqueta={tipo === 'AEREO' ? 'Vuelos' : 'Buses'} checked={filtros.tipos.includes(tipo)} onChange={() => setFiltros({ ...filtros, tipos: alternar(filtros.tipos, tipo) })} className="w-full" />
          ))}
        </GrupoFiltro>
      ) : null}
      <GrupoFiltro titulo="Hora de salida">
        <div className="grid grid-cols-2 gap-2">
          {FRANJAS.map((franja) => {
            const cantidad = conteoFranja(franja.clave)
            const activa = filtros.franjas.includes(franja.clave)
            return (
              <button
                key={franja.clave}
                type="button"
                disabled={!cantidad}
                onClick={() => setFiltros({ ...filtros, franjas: alternar(filtros.franjas, franja.clave) })}
                className={`rounded-lg px-2 py-2 text-left text-xs ring-1 transition disabled:opacity-40 ${activa ? 'bg-marca-50 ring-marca-500' : 'bg-white ring-slate-200 hover:ring-slate-300'}`}
              >
                <span className="block font-bold text-slate-800">{franja.texto}</span>
                <span className="block text-slate-500">{franja.rango}</span>
                <span className="block text-slate-400">{cantidad} {cantidad === 1 ? 'viaje' : 'viajes'}</span>
              </button>
            )
          })}
        </div>
      </GrupoFiltro>
      <GrupoFiltro titulo="Precio por viajero">
        <input
          type="range"
          min={limites.precioMin}
          max={limites.precioMax}
          step={1000}
          value={precioMax}
          onChange={(evento) => setFiltros({ ...filtros, precioMax: Number(evento.target.value) })}
          className="w-full accent-marca-600"
          aria-label="Precio máximo"
        />
        <p className="text-xs text-slate-600">
          Hasta <strong>{dinero(precioMax)}</strong>
        </p>
      </GrupoFiltro>
      <GrupoFiltro titulo="Duración">
        <input
          type="range"
          min={limites.duracionMin}
          max={limites.duracionMax}
          step={1}
          value={duracionMax}
          onChange={(evento) => setFiltros({ ...filtros, duracionMax: Number(evento.target.value) })}
          className="w-full accent-marca-600"
          aria-label="Duración máxima"
        />
        <p className="text-xs text-slate-600">
          Hasta <strong>{duracion(duracionMax)}</strong>
        </p>
      </GrupoFiltro>
      <GrupoFiltro titulo="Empresas">
        {empresas.map((empresa) => (
          <label key={empresa.nombre} className="flex cursor-pointer items-center justify-between gap-2 text-sm text-slate-700">
            <span className="flex min-w-0 items-center gap-2">
              <input type="checkbox" className="size-4 accent-marca-600" checked={filtros.empresas.includes(empresa.nombre)} onChange={() => setFiltros({ ...filtros, empresas: alternar(filtros.empresas, empresa.nombre) })} />
              <span className="truncate">{empresa.nombre}</span>
            </span>
            <span className="shrink-0 text-xs text-slate-500">{dinero(empresa.precio)}</span>
          </label>
        ))}
      </GrupoFiltro>
      <GrupoFiltro titulo="Clase">
        {clases.map((clase) => (
          <Casilla key={clase} etiqueta={legible(clase)} checked={filtros.clases.includes(clase)} onChange={() => setFiltros({ ...filtros, clases: alternar(filtros.clases, clase) })} className="w-full" />
        ))}
      </GrupoFiltro>
      <GrupoFiltro titulo="Condiciones">
        <Casilla etiqueta="Permite reembolso" checked={filtros.reembolso} onChange={(evento) => setFiltros({ ...filtros, reembolso: evento.target.checked })} className="w-full" />
        <Casilla etiqueta="Permite cambios" checked={filtros.cambios} onChange={(evento) => setFiltros({ ...filtros, cambios: evento.target.checked })} className="w-full" />
      </GrupoFiltro>
    </div>
  )
}

function OpcionClase({ clase, pasajeros, alElegir }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900">{legible(clase.nombre)}</p>
        <p className="text-sm text-slate-500">{clase.descripcion}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Briefcase className="size-3.5" />
            Bodega {cifra(clase.equipajeIncluidoKg)} kg
          </span>
          <span className={`inline-flex items-center gap-1 ${clase.permiteCambios ? 'text-emerald-700' : 'text-slate-400'}`}>
            <RefreshCw className="size-3.5" />
            {clase.permiteCambios ? 'Con cambios' : 'Sin cambios'}
          </span>
          <span className={`inline-flex items-center gap-1 ${clase.permiteReembolso ? 'text-emerald-700' : 'text-slate-400'}`}>
            <Undo2 className="size-3.5" />
            {clase.permiteReembolso ? 'Reembolsable' : 'No reembolsable'}
          </span>
          {clase.cuposDisponibles < 10 ? <span className="font-semibold text-rose-600">Quedan {clase.cuposDisponibles} sillas</span> : <span>{clase.cuposDisponibles} sillas libres</span>}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1">
        <div className="text-right">
          <p className="text-xl font-extrabold text-noche-900">{dinero(clase.precioTotal)}</p>
          <p className="text-xs text-slate-500">{pasajeros > 1 ? `${dinero(clase.precioTotal * pasajeros)} por ${pasajeros} viajeros` : 'Impuestos incluidos'}</p>
        </div>
        <Boton onClick={() => alElegir(clase)} variante="primario">
          Elegir
          <ArrowRight className="size-4" />
        </Boton>
      </div>
    </div>
  )
}

function TarjetaViaje({ viaje, pasajeros, etiquetas, alElegir }) {
  const [abierto, setAbierto] = useState(false)
  const aereo = viaje.tipoTransporte === 'AEREO'
  const Icono = aereo ? Plane : BusFront
  const desde = precioDesde(viaje)
  const diasDespues = Math.round((aFecha(aIsoLocal(aFecha(viaje.fechaHoraLlegada))) - aFecha(aIsoLocal(aFecha(viaje.fechaHoraSalida)))) / 86400000)

  return (
    <article className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition ${abierto ? 'ring-marca-400' : 'ring-slate-200 hover:ring-slate-300'}`}>
      <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {etiquetas.map((etiqueta) => (
              <span key={etiqueta} className="rounded-md bg-marca-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-marca-700">
                {etiqueta}
              </span>
            ))}
            {viaje.estado !== 'PROGRAMADO' ? <Insignia estado={viaje.estado} /> : null}
          </div>
          <div className="flex items-center gap-4">
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${aereo ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <Icono className="size-5" />
            </span>
            <div className="grid flex-1 grid-cols-[auto_1fr_auto] items-center gap-3">
              <div>
                <p className="text-xl font-extrabold text-slate-900">{hora(viaje.fechaHoraSalida)}</p>
                <p className="text-xs font-semibold text-slate-500">{viaje.ciudadOrigen}</p>
              </div>
              <div className="flex flex-col items-center px-2">
                <p className="text-xs font-semibold text-slate-500">{duracion(viaje.duracionMin)}</p>
                <div className="relative my-1 h-px w-full bg-slate-300">
                  <span className="absolute -top-1 left-0 size-2 rounded-full bg-slate-300" />
                  <span className="absolute -top-1 right-0 size-2 rounded-full bg-slate-300" />
                </div>
                <p className="text-[11px] text-slate-400">Directo</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-slate-900">
                  {hora(viaje.fechaHoraLlegada)}
                  {diasDespues > 0 ? <sup className="ml-0.5 text-xs font-bold text-rose-600">+{diasDespues}</sup> : null}
                </p>
                <p className="text-xs font-semibold text-slate-500">{viaje.ciudadDestino}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{viaje.empresa}</span>
            <span>
              {viaje.codigoViaje} · {viaje.vehiculo}
            </span>
            <span>{fecha(viaje.fechaHoraSalida)}</span>
            <span>
              {viaje.terminalOrigen} → {viaje.terminalDestino}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 md:w-48 md:flex-col md:items-end md:border-l md:border-t-0 md:pl-5 md:pt-0">
          <div className="md:text-right">
            <p className="text-xs text-slate-500">Desde</p>
            <p className="text-2xl font-extrabold text-noche-900">{dinero(desde)}</p>
            <p className="text-xs text-slate-500">por viajero</p>
          </div>
          <Boton variante={abierto ? 'secundario' : 'acento'} onClick={() => setAbierto((valor) => !valor)}>
            {abierto ? 'Ocultar' : 'Ver opciones'}
            <ChevronDown className={`size-4 transition ${abierto ? 'rotate-180' : ''}`} />
          </Boton>
        </div>
      </div>
      {abierto ? (
        <div className="aparecer space-y-3 border-t border-slate-200 bg-slate-50 p-4 sm:p-5">
          {viaje.clases.map((clase) => (
            <OpcionClase key={clase.codClase} clase={clase} pasajeros={pasajeros} alElegir={(elegida) => alElegir(viaje, elegida)} />
          ))}
          <p className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="size-3.5" />
            Puerta o andén: {viaje.puertaAnden ?? 'por confirmar'}. La venta cierra 1 hora antes de la salida.
          </p>
        </div>
      ) : null}
    </article>
  )
}

function FranjaFechas({ fechaActual, alCambiar, viajes, flexible, diaElegido, setDiaElegido }) {
  const hoy = hoyIso()
  if (flexible) {
    const porDia = new Map()
    viajes.forEach((viaje) => {
      const dia = aIsoLocal(aFecha(viaje.fechaHoraSalida))
      porDia.set(dia, Math.min(porDia.get(dia) ?? Infinity, precioDesde(viaje)))
    })
    const dias = [...porDia.keys()].sort()
    if (!dias.length) return null
    const minimo = Math.min(...porDia.values())
    return (
      <div className="desplazable flex gap-2 overflow-x-auto pb-1">
        <button type="button" onClick={() => setDiaElegido('')} className={`shrink-0 rounded-xl px-4 py-2 text-left text-sm ring-1 ${!diaElegido ? 'bg-noche-900 text-white ring-noche-900' : 'bg-white ring-slate-200 hover:ring-slate-300'}`}>
          <span className="block font-bold">Todos</span>
          <span className="block text-xs opacity-75">{viajes.length} {viajes.length === 1 ? 'viaje' : 'viajes'}</span>
        </button>
        {dias.map((dia) => (
          <button key={dia} type="button" onClick={() => setDiaElegido(dia)} className={`shrink-0 rounded-xl px-4 py-2 text-left text-sm ring-1 ${diaElegido === dia ? 'bg-noche-900 text-white ring-noche-900' : 'bg-white ring-slate-200 hover:ring-slate-300'}`}>
            <span className="block font-bold">{fecha(dia, { year: undefined })}</span>
            <span className={`block text-xs ${porDia.get(dia) === minimo && diaElegido !== dia ? 'font-bold text-emerald-700' : 'opacity-75'}`}>{dinero(porDia.get(dia))}</span>
          </button>
        ))}
      </div>
    )
  }
  const dias = [-3, -2, -1, 0, 1, 2, 3].map((desplazamiento) => sumarDias(fechaActual, desplazamiento)).filter((dia) => dia >= hoy)
  return (
    <div className="flex items-center gap-2">
      <button type="button" disabled={fechaActual <= hoy} onClick={() => alCambiar(sumarDias(fechaActual, -1))} className="grid size-9 shrink-0 place-items-center rounded-full bg-white ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40" aria-label="Día anterior">
        <ChevronLeft className="size-4" />
      </button>
      <div className="desplazable flex flex-1 gap-2 overflow-x-auto">
        {dias.map((dia) => (
          <button key={dia} type="button" onClick={() => alCambiar(dia)} className={`flex-1 shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold ring-1 ${dia === fechaActual ? 'bg-noche-900 text-white ring-noche-900' : 'bg-white text-slate-700 ring-slate-200 hover:ring-slate-300'}`}>
            {fecha(dia, { year: undefined })}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => alCambiar(sumarDias(fechaActual, 1))} className="grid size-9 shrink-0 place-items-center rounded-full bg-white ring-1 ring-slate-200 hover:bg-slate-50" aria-label="Día siguiente">
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}

export default function Resultados() {
  const [parametros] = useSearchParams()
  const navegar = useNavigate()
  const { esPersonal, clienteTaquilla } = useSesion()
  const ciudades = useCatalogo('/ciudades')
  const origen = parametros.get('origen')
  const destino = parametros.get('destino')
  const fechaBuscada = parametros.get('fecha') ?? ''
  const pasajeros = Number(parametros.get('pasajeros') ?? 1)
  const tipo = parametros.get('tipo') ?? ''
  const flexible = !fechaBuscada
  const llave = parametros.toString()

  const [estado, setEstado] = useState({ cargando: true, viajes: [], error: null, llave: '' })
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [orden, setOrden] = useState('recomendado')
  const [diaElegido, setDiaElegido] = useState('')
  const [verFiltros, setVerFiltros] = useState(false)

  useEffect(() => {
    let vigente = true
    compras
      .buscar({ origen, destino, fecha: fechaBuscada || undefined, pasajeros })
      .then((viajes) => {
        if (!vigente) return
        setEstado({ cargando: false, viajes, error: null, llave })
        setFiltros({ ...FILTROS_VACIOS, tipos: tipo ? [tipo] : [] })
        setDiaElegido('')
      })
      .catch((error) => vigente && setEstado({ cargando: false, viajes: [], error, llave }))
    return () => {
      vigente = false
    }
  }, [origen, destino, fechaBuscada, pasajeros, tipo, llave])

  const cargando = estado.cargando || estado.llave !== llave
  const nombreCiudad = (codigo) => ciudades.datos.find((ciudad) => ciudad.codCiudad === Number(codigo))?.nombre ?? '…'

  const limites = useMemo(() => {
    const precios = estado.viajes.map(precioDesde)
    const duraciones = estado.viajes.map((viaje) => viaje.duracionMin)
    return {
      precioMin: precios.length ? Math.floor(Math.min(...precios) / 1000) * 1000 : 0,
      precioMax: precios.length ? Math.ceil(Math.max(...precios) / 1000) * 1000 : 0,
      duracionMin: duraciones.length ? Math.min(...duraciones) : 0,
      duracionMax: duraciones.length ? Math.max(...duraciones) : 0,
    }
  }, [estado.viajes])

  const filtrados = useMemo(() => {
    return estado.viajes
      .map((viaje) => {
        const clases = viaje.clases.filter(
          (clase) =>
            (!filtros.clases.length || filtros.clases.includes(clase.nombre)) &&
            (!filtros.reembolso || clase.permiteReembolso) &&
            (!filtros.cambios || clase.permiteCambios) &&
            (filtros.precioMax === null || clase.precioTotal <= filtros.precioMax),
        )
        return { ...viaje, clases }
      })
      .filter(
        (viaje) =>
          viaje.clases.length > 0 &&
          (!filtros.tipos.length || filtros.tipos.includes(viaje.tipoTransporte)) &&
          (!filtros.empresas.length || filtros.empresas.includes(viaje.empresa)) &&
          (!filtros.franjas.length || filtros.franjas.includes(franjaDe(viaje.fechaHoraSalida))) &&
          (filtros.duracionMax === null || viaje.duracionMin <= filtros.duracionMax) &&
          (!diaElegido || aIsoLocal(aFecha(viaje.fechaHoraSalida)) === diaElegido),
      )
  }, [estado.viajes, filtros, diaElegido])

  const resumen = useMemo(() => {
    if (!filtrados.length) return null
    const precioMinimo = Math.min(...filtrados.map(precioDesde))
    const duracionMinima = Math.min(...filtrados.map((viaje) => viaje.duracionMin))
    const ordenados = {
      recomendado: [...filtrados].sort((a, b) => puntaje(a, precioMinimo, duracionMinima) - puntaje(b, precioMinimo, duracionMinima)),
      barato: [...filtrados].sort((a, b) => precioDesde(a) - precioDesde(b)),
      rapido: [...filtrados].sort((a, b) => a.duracionMin - b.duracionMin || precioDesde(a) - precioDesde(b)),
      temprano: [...filtrados].sort((a, b) => a.fechaHoraSalida.localeCompare(b.fechaHoraSalida)),
    }
    return { ordenados, precioMinimo, duracionMinima }
  }, [filtrados])

  const etiquetasDe = (viaje) => {
    if (!resumen) return []
    const etiquetas = []
    if (resumen.ordenados.recomendado[0]?.codViaje === viaje.codViaje) etiquetas.push('Mejor opción')
    if (precioDesde(viaje) === resumen.precioMinimo) etiquetas.push('Más barato')
    if (viaje.duracionMin === resumen.duracionMinima && filtrados.length > 1) etiquetas.push('Más rápido')
    return etiquetas
  }

  const cambiarFecha = (nueva) => {
    navegar(`/buscar?${aConsulta({ origen, destino, fecha: nueva, pasajeros, tipo })}`)
  }

  const elegir = (viaje, clase) => {
    const consulta = { origen, destino, fecha: fechaBuscada, pasajeros, tipo }
    recordarViaje(viaje, consulta)
    navegar(`/compra/${viaje.codViaje}?clase=${clase.codClase}&pasajeros=${pasajeros}`, { state: { viaje, consulta } })
  }

  const hayFiltros = JSON.stringify(filtros) !== JSON.stringify({ ...FILTROS_VACIOS, tipos: tipo ? [tipo] : [] })
  const lista = resumen ? resumen.ordenados[orden] : []

  return (
    <div>
      <div className="bg-noche-900 pb-5 pt-4">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl bg-white p-3 shadow-lg">
            <Buscador key={llave} compacto inicial={{ origen, destino, fecha: fechaBuscada, pasajeros, tipo, flexible }} />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pt-5">
        {esPersonal && !clienteTaquilla ? (
          <Aviso tipo="alerta" className="mb-4">
            Para vender un tiquete en taquilla primero <Link to="/panel/taquilla" className="font-semibold underline">elige el cliente</Link>.
          </Aviso>
        ) : null}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-noche-900">
              {nombreCiudad(origen)} → {nombreCiudad(destino)}
            </h1>
            <p className="text-sm text-slate-500">
              {flexible ? 'Próximos 30 días' : fecha(fechaBuscada)} · {pasajeros} {pasajeros === 1 ? 'viajero' : 'viajeros'}
            </p>
          </div>
          <Boton variante="secundario" tamano="sm" icono={SlidersHorizontal} className="lg:hidden" onClick={() => setVerFiltros(true)}>
            Filtros
          </Boton>
        </div>
        {!cargando && !estado.error ? (
          <div className="mb-4">
            <FranjaFechas fechaActual={fechaBuscada} alCambiar={cambiarFecha} viajes={estado.viajes} flexible={flexible} diaElegido={diaElegido} setDiaElegido={setDiaElegido} />
          </div>
        ) : null}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className={`${verFiltros ? 'fixed inset-0 z-50 overflow-y-auto bg-white p-5' : 'hidden'} lg:static lg:block lg:bg-transparent lg:p-0`}>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-bold text-noche-900">Filtrar resultados</p>
              <div className="flex items-center gap-2">
                {hayFiltros ? (
                  <button type="button" className="text-sm font-semibold text-marca-700 hover:underline" onClick={() => { setFiltros({ ...FILTROS_VACIOS, tipos: tipo ? [tipo] : [] }); setDiaElegido('') }}>
                    Limpiar
                  </button>
                ) : null}
                <button type="button" className="rounded-lg p-1 lg:hidden" onClick={() => setVerFiltros(false)} aria-label="Cerrar filtros">
                  <X className="size-5" />
                </button>
              </div>
            </div>
            {estado.viajes.length ? <Filtros viajes={estado.viajes} filtros={filtros} setFiltros={setFiltros} limites={limites} /> : <p className="text-sm text-slate-500">Sin resultados para filtrar.</p>}
            <Boton className="mt-4 w-full lg:hidden" onClick={() => setVerFiltros(false)}>
              Ver {filtrados.length} resultados
            </Boton>
          </aside>
          <section>
            {cargando ? <Cargando texto="Buscando los mejores viajes…" /> : null}
            {!cargando && estado.error ? <Aviso tipo="error">{estado.error.message}</Aviso> : null}
            {!cargando && !estado.error && !estado.viajes.length ? (
              <Vacio imagen={FOTO_SIN_RESULTADOS.src} posicion={FOTO_SIN_RESULTADOS.posicion} titulo="No encontramos viajes para esta búsqueda">
                Prueba con otra fecha, marca fechas flexibles para ver los próximos 30 días o cambia el número de viajeros.
              </Vacio>
            ) : null}
            {!cargando && estado.viajes.length > 0 ? (
              <>
                <div className="mb-4 grid grid-cols-2 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 sm:grid-cols-4">
                  {ORDENES.map((opcion) => {
                    const primero = resumen?.ordenados[opcion.clave][0]
                    return (
                      <button
                        key={opcion.clave}
                        type="button"
                        onClick={() => setOrden(opcion.clave)}
                        className={`border-b-4 px-4 py-3 text-left transition ${orden === opcion.clave ? 'border-marca-500 bg-marca-50/50' : 'border-transparent hover:bg-slate-50'}`}
                      >
                        <span className="block text-sm font-bold text-slate-900">{opcion.texto}</span>
                        {primero ? (
                          <span className="block text-xs text-slate-500">
                            {dinero(precioDesde(primero))} · {duracion(primero.duracionMin)}
                          </span>
                        ) : (
                          <span className="block text-xs text-slate-400">—</span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="mb-3 text-sm text-slate-500">
                  {filtrados.length} de {estado.viajes.length} viajes
                </p>
                {!filtrados.length ? (
                  <Vacio icono={SlidersHorizontal} titulo="Ningún viaje cumple los filtros" accion={<Boton variante="secundario" onClick={() => { setFiltros(FILTROS_VACIOS); setDiaElegido('') }}>Quitar filtros</Boton>} />
                ) : (
                  <div className="space-y-3">
                    {lista.map((viaje) => (
                      <TarjetaViaje key={viaje.codViaje} viaje={viaje} pasajeros={pasajeros} etiquetas={etiquetasDe(viaje)} alElegir={elegir} />
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}

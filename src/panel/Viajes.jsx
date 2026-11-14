import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Ban, BusFront, CalendarPlus, Clock, Pencil, Plane, Plus, RefreshCw, Search, Settings, Undo2 } from 'lucide-react'
import ModalEntidad from './ModalEntidad'
import { ENTIDADES } from './entidades'
import { Aviso, Boton, Cargando, Dato, Entrada, Insignia, Modal, Paginador, Selector, Tarjeta, Titulo, Vacio } from '../components/ui'
import { api, compras } from '../api/servicios'
import { cargarCatalogo, olvidarCatalogo, useCatalogo } from '../api/catalogos'
import { dinero, falta, fecha, fechaHora, hora, legible, sinTildes } from '../util/formato'

const ENTIDAD_VIAJE = ENTIDADES.find((entidad) => entidad.clave === 'viajes')
const ENTIDAD_TARIFA = ENTIDADES.find((entidad) => entidad.clave === 'tarifas')
const POR_PAGINA = 20

const PESTANAS = [
  { clave: 'semana', texto: 'Próximos 7 días' },
  { clave: 'proximos', texto: 'Todos los próximos' },
  { clave: 'pasados', texto: 'Ya salieron' },
  { clave: 'todos', texto: 'Todos' },
]

function cuerpoViaje(viaje, cambios) {
  return {
    codigoViaje: viaje.codigoViaje,
    fechaHoraSalida: viaje.fechaHoraSalida,
    fechaHoraLlegada: viaje.fechaHoraLlegada,
    puertaAnden: viaje.puertaAnden,
    estado: { codEstado: viaje.estado.codEstado },
    ruta: { codRuta: viaje.ruta.codRuta },
    vehiculo: { codVehiculo: viaje.vehiculo.codVehiculo },
    ...cambios,
  }
}

function DetalleViaje({ viaje, alCerrar, alCambiar }) {
  const estados = useCatalogo('/estados-viaje')
  const [mapa, setMapa] = useState(null)
  const [tarifas, setTarifas] = useState({ cargando: true, lista: [] })
  const [editar, setEditar] = useState(false)
  const [tarifa, setTarifa] = useState(undefined)
  const [confirmar, setConfirmar] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const cargarTarifas = useCallback((refrescar = false) => {
    cargarCatalogo('/tarifas', { refrescar })
      .then((lista) => setTarifas({ cargando: false, lista: lista.filter((fila) => fila.viaje.codViaje === viaje.codViaje) }))
      .catch(() => setTarifas({ cargando: false, lista: [] }))
  }, [viaje.codViaje])

  useEffect(() => {
    compras
      .asientos(viaje.codViaje)
      .then(setMapa)
      .catch(() => setMapa(null))
    cargarTarifas()
  }, [viaje.codViaje, cargarTarifas])

  const ocupacion = useMemo(() => {
    if (!mapa) return []
    const porClase = new Map()
    mapa.asientos.forEach((asiento) => {
      const actual = porClase.get(asiento.clase) ?? { clase: asiento.clase, total: 0, ocupadas: 0 }
      actual.total += 1
      if (asiento.ocupado) actual.ocupadas += 1
      porClase.set(asiento.clase, actual)
    })
    return [...porClase.values()]
  }, [mapa])

  const cambiarEstado = async (nombre) => {
    const estado = estados.datos.find((opcion) => opcion.nombre === nombre)
    if (!estado) return
    setEnviando(true)
    try {
      const actualizado = await api.put(`/viajes/${viaje.codViaje}`, cuerpoViaje(viaje, { estado: { codEstado: estado.codEstado } }))
      setConfirmar(null)
      setMensaje({ tipo: 'exito', texto: `El viaje quedó ${legible(nombre).toLowerCase()}. Los pasajeros con tiquete reciben el aviso por correo.` })
      alCambiar(actualizado)
    } catch (fallo) {
      setConfirmar(null)
      setMensaje({ tipo: 'error', texto: fallo.message })
    } finally {
      setEnviando(false)
    }
  }

  const aereo = viaje.ruta?.terminalOrigen?.tipoTransporte?.nombre === 'AEREO'
  const Icono = aereo ? Plane : BusFront
  const salio = new Date(viaje.fechaHoraSalida) < new Date()

  return (
    <Modal abierto alCerrar={alCerrar} ancho="max-w-3xl" titulo={`Viaje ${viaje.codigoViaje}`}>
      {mensaje ? (
        <Aviso tipo={mensaje.tipo} className="mb-4" alCerrar={() => setMensaje(null)}>
          {mensaje.texto}
        </Aviso>
      ) : null}
      <div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-4">
        <span className="grid size-11 place-items-center rounded-xl bg-white text-noche-700 ring-1 ring-slate-200">
          <Icono className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900">
            {viaje.ruta?.terminalOrigen?.ciudad?.nombre} → {viaje.ruta?.terminalDestino?.ciudad?.nombre}
          </p>
          <p className="text-sm text-slate-500">
            {fecha(viaje.fechaHoraSalida)} · {hora(viaje.fechaHoraSalida)} a {hora(viaje.fechaHoraLlegada)}
          </p>
        </div>
        <Insignia estado={viaje.estado?.nombre} className="text-sm" />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Dato etiqueta="Ruta">{viaje.ruta?.codigo}</Dato>
        <Dato etiqueta="Vehículo">
          {viaje.vehiculo?.matricula}
          <span className="block text-xs font-normal text-slate-500">{viaje.vehiculo?.modelo}</span>
        </Dato>
        <Dato etiqueta="Puerta o andén">{viaje.puertaAnden ?? 'Sin asignar'}</Dato>
        <Dato etiqueta="Sale">{salio ? 'Ya salió' : falta(viaje.fechaHoraSalida)}</Dato>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <Boton icono={Pencil} onClick={() => setEditar(true)}>
          Editar horario, puerta o vehículo
        </Boton>
        {viaje.estado?.nombre === 'PROGRAMADO' ? (
          <Boton variante="secundario" icono={Clock} onClick={() => setConfirmar('RETRASADO')}>
            Marcar retrasado
          </Boton>
        ) : null}
        {viaje.estado?.nombre === 'RETRASADO' ? (
          <Boton variante="secundario" icono={Undo2} onClick={() => setConfirmar('PROGRAMADO')}>
            Volver a programado
          </Boton>
        ) : null}
        {['PROGRAMADO', 'RETRASADO'].includes(viaje.estado?.nombre) ? (
          <Boton variante="fantasma" className="text-rose-600 hover:bg-rose-50" icono={Ban} onClick={() => setConfirmar('CANCELADO')}>
            Cancelar viaje
          </Boton>
        ) : null}
      </div>
      {confirmar ? (
        <Aviso tipo={confirmar === 'CANCELADO' ? 'alerta' : 'info'} className="mt-4" titulo={`¿Cambiar el estado a ${legible(confirmar).toLowerCase()}?`}>
          <p>Se enviará un aviso por correo a todos los pasajeros con tiquete en este viaje.</p>
          <div className="mt-3 flex gap-2">
            <Boton tamano="sm" variante={confirmar === 'CANCELADO' ? 'peligro' : 'primario'} cargando={enviando} onClick={() => cambiarEstado(confirmar)}>
              Sí, cambiar
            </Boton>
            <Boton tamano="sm" variante="secundario" onClick={() => setConfirmar(null)}>
              No
            </Boton>
          </div>
        </Aviso>
      ) : null}

      <div className="mt-6">
        <p className="mb-2 text-sm font-bold text-noche-900">Ocupación</p>
        {!mapa ? <Cargando className="py-4" /> : null}
        <div className="grid gap-3 sm:grid-cols-3">
          {ocupacion.map((fila) => {
            const porcentaje = fila.total ? Math.round((fila.ocupadas / fila.total) * 100) : 0
            return (
              <div key={fila.clase} className="rounded-xl p-3 ring-1 ring-slate-200">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold">{legible(fila.clase)}</span>
                  <span className="text-slate-500">
                    {fila.ocupadas} de {fila.total}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-marca-100">
                  <div className="h-full rounded-full bg-marca-600" style={{ width: `${porcentaje}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{porcentaje}% ocupado</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-bold text-noche-900">Tarifas y cupos</p>
          <Boton tamano="sm" variante="secundario" icono={Plus} onClick={() => setTarifa(null)}>
            Agregar tarifa
          </Boton>
        </div>
        {tarifas.cargando ? <Cargando className="py-4" /> : null}
        {!tarifas.cargando && !tarifas.lista.length ? <p className="text-sm text-slate-500">Este viaje no tiene tarifas, así que no aparece en las búsquedas.</p> : null}
        {tarifas.lista.length ? (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-1.5">Clase</th>
                <th className="py-1.5 text-right">Tarifa</th>
                <th className="py-1.5 text-right">Impuestos</th>
                <th className="py-1.5 text-right">Total</th>
                <th className="py-1.5 text-right">Cupos</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tarifas.lista.map((fila) => (
                <tr key={fila.claseServicio.codClase}>
                  <td className="py-2 font-semibold">{legible(fila.claseServicio.nombre)}</td>
                  <td className="py-2 text-right">{dinero(fila.precioBase)}</td>
                  <td className="py-2 text-right">{dinero(fila.impuestos)}</td>
                  <td className="py-2 text-right font-semibold">{dinero(Number(fila.precioBase) + Number(fila.impuestos))}</td>
                  <td className="py-2 text-right">{fila.cuposDisponibles}</td>
                  <td className="py-2 text-right">
                    <Boton variante="fantasma" tamano="sm" icono={Pencil} onClick={() => setTarifa(fila)}>
                      Editar
                    </Boton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      {editar ? (
        <ModalEntidad
          entidad={ENTIDAD_VIAJE}
          fila={viaje}
          abierto
          titulo={`Editar el viaje ${viaje.codigoViaje}`}
          alCerrar={() => setEditar(false)}
          despues={<p className="mt-4 text-xs text-slate-500">Si cambias la hora, la puerta o el estado, los pasajeros reciben un aviso por correo.</p>}
          alGuardar={(actualizado) => {
            setEditar(false)
            setMensaje({ tipo: 'exito', texto: 'Viaje actualizado. Si cambió la hora, la puerta o el estado, se avisó a los pasajeros.' })
            alCambiar(actualizado)
          }}
        />
      ) : null}
      {tarifa !== undefined ? (
        <ModalEntidad
          key={tarifa ? tarifa.claseServicio.codClase : 'nueva'}
          entidad={ENTIDAD_TARIFA}
          fila={tarifa}
          inicial={{ viaje: viaje.codViaje }}
          abierto
          titulo={tarifa ? `Tarifa ${legible(tarifa.claseServicio.nombre)}` : 'Nueva tarifa'}
          alCerrar={() => setTarifa(undefined)}
          alGuardar={() => {
            setTarifa(undefined)
            olvidarCatalogo('/tarifas')
            cargarTarifas(true)
          }}
        />
      ) : null}
    </Modal>
  )
}

export default function Viajes() {
  const [parametros] = useSearchParams()
  const estados = useCatalogo('/estados-viaje')
  const [estado, setEstado] = useState({ cargando: true, viajes: [], error: null })
  const [pestana, setPestana] = useState('semana')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [pagina, setPagina] = useState(1)
  const [elegido, setElegido] = useState(null)
  const [nuevo, setNuevo] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const cargar = useCallback((refrescar = false) => {
    setEstado((actual) => ({ ...actual, cargando: true }))
    cargarCatalogo('/viajes', { refrescar })
      .then((viajes) => setEstado({ cargando: false, viajes, error: null }))
      .catch((error) => setEstado({ cargando: false, viajes: [], error }))
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const pedido = parametros.get('viaje')
  useEffect(() => {
    if (pedido && estado.viajes.length) {
      const encontrado = estado.viajes.find((viaje) => viaje.codViaje === Number(pedido))
      if (encontrado) setElegido(encontrado)
    }
  }, [pedido, estado.viajes])

  const filtrados = useMemo(() => {
    const ahora = Date.now()
    const semana = ahora + 7 * 86400000
    const filtro = sinTildes(busqueda.trim())
    return estado.viajes
      .filter((viaje) => {
        const salida = new Date(viaje.fechaHoraSalida).getTime()
        if (pestana === 'semana' && (salida < ahora - 3600000 * 3 || salida > semana)) return false
        if (pestana === 'proximos' && salida < ahora - 3600000 * 3) return false
        if (pestana === 'pasados' && salida >= ahora) return false
        if (filtroEstado && viaje.estado?.nombre !== filtroEstado) return false
        if (!filtro) return true
        const lugar = [viaje.codigoViaje, viaje.ruta?.codigo, viaje.ruta?.terminalOrigen?.ciudad?.nombre, viaje.ruta?.terminalDestino?.ciudad?.nombre, viaje.vehiculo?.matricula, viaje.vehiculo?.empresa?.nombre].join(' ')
        return sinTildes(lugar).includes(filtro)
      })
      .sort((a, b) => (pestana === 'pasados' ? b.fechaHoraSalida.localeCompare(a.fechaHoraSalida) : a.fechaHoraSalida.localeCompare(b.fechaHoraSalida)))
  }, [estado.viajes, pestana, busqueda, filtroEstado])

  const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const reemplazar = (actualizado) => {
    olvidarCatalogo('/viajes')
    setEstado((actual) => ({ ...actual, viajes: actual.viajes.map((viaje) => (viaje.codViaje === actualizado.codViaje ? actualizado : viaje)) }))
    setElegido(actualizado)
  }

  return (
    <div>
      <Titulo
        titulo="Operación de viajes"
        descripcion="Programa viajes, cambia horarios, puertas y estados, y administra las tarifas y cupos."
        acciones={
          <>
            <Boton variante="secundario" icono={RefreshCw} onClick={() => cargar(true)}>
              Actualizar
            </Boton>
            <Boton icono={CalendarPlus} onClick={() => setNuevo(true)}>
              Programar viaje
            </Boton>
          </>
        }
      />
      {mensaje ? (
        <Aviso tipo="exito" className="mt-4" alCerrar={() => setMensaje('')}>
          {mensaje}
        </Aviso>
      ) : null}
      <div className="desplazable mt-5 flex gap-1 overflow-x-auto border-b border-slate-200">
        {PESTANAS.map((opcion) => (
          <button
            key={opcion.clave}
            type="button"
            onClick={() => {
              setPestana(opcion.clave)
              setPagina(1)
            }}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold ${pestana === opcion.clave ? 'border-marca-600 text-marca-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {opcion.texto}
          </button>
        ))}
      </div>
      <Tarjeta className="mt-4">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Entrada value={busqueda} onChange={(evento) => { setBusqueda(evento.target.value); setPagina(1) }} placeholder="Código, ruta, ciudad, matrícula o empresa" className="pl-9" />
          </div>
          <Selector value={filtroEstado} onChange={(evento) => { setFiltroEstado(evento.target.value); setPagina(1) }} className="w-48">
            <option value="">Todos los estados</option>
            {estados.datos.map((opcion) => (
              <option key={opcion.codEstado} value={opcion.nombre}>
                {legible(opcion.nombre)}
              </option>
            ))}
          </Selector>
          <span className="text-sm text-slate-500">{filtrados.length} viajes</span>
        </div>
        {estado.cargando ? <Cargando /> : null}
        {estado.error ? <Aviso tipo="error" className="m-3">{estado.error.message}</Aviso> : null}
        {!estado.cargando && !filtrados.length ? <Vacio icono={Plane} titulo="No hay viajes con estos filtros" /> : null}
        {!estado.cargando && visibles.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Viaje</th>
                  <th className="px-4 py-2.5 font-semibold">Ruta</th>
                  <th className="px-4 py-2.5 font-semibold">Salida</th>
                  <th className="px-4 py-2.5 font-semibold">Llegada</th>
                  <th className="px-4 py-2.5 font-semibold">Vehículo</th>
                  <th className="px-4 py-2.5 font-semibold">Puerta</th>
                  <th className="px-4 py-2.5 font-semibold">Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibles.map((viaje) => (
                  <tr key={viaje.codViaje} className="cursor-pointer hover:bg-slate-50" onClick={() => setElegido(viaje)}>
                    <td className="px-4 py-2.5 font-semibold">{viaje.codigoViaje}</td>
                    <td className="px-4 py-2.5">
                      {viaje.ruta?.codigo}
                      <span className="block text-xs text-slate-500">
                        {viaje.ruta?.terminalOrigen?.ciudad?.nombre} → {viaje.ruta?.terminalDestino?.ciudad?.nombre}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">{fechaHora(viaje.fechaHoraSalida)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">{fechaHora(viaje.fechaHoraLlegada)}</td>
                    <td className="px-4 py-2.5">{viaje.vehiculo?.matricula}</td>
                    <td className="px-4 py-2.5">{viaje.puertaAnden ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <Insignia estado={viaje.estado?.nombre} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Boton variante="fantasma" tamano="sm" icono={Settings}>
                        Gestionar
                      </Boton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <div className="px-3">
          <Paginador pagina={pagina} total={filtrados.length} porPagina={POR_PAGINA} alCambiar={setPagina} />
        </div>
      </Tarjeta>
      {elegido ? <DetalleViaje key={elegido.codViaje} viaje={elegido} alCerrar={() => setElegido(null)} alCambiar={reemplazar} /> : null}
      {nuevo ? (
        <ModalEntidad
          entidad={ENTIDAD_VIAJE}
          fila={null}
          abierto
          titulo="Programar un viaje"
          inicial={{ estado: estados.datos.find((opcion) => opcion.nombre === 'PROGRAMADO')?.codEstado ?? '' }}
          alCerrar={() => setNuevo(false)}
          alGuardar={(creado) => {
            setNuevo(false)
            olvidarCatalogo('/viajes')
            setMensaje(`Viaje ${creado.codigoViaje} programado. Agrégale tarifas para que aparezca en las búsquedas.`)
            setEstado((actual) => ({ ...actual, viajes: [...actual.viajes, creado] }))
            setElegido(creado)
          }}
        />
      ) : null}
    </div>
  )
}

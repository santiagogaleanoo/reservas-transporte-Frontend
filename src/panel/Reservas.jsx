import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, RefreshCw, Search, Store, Ticket } from 'lucide-react'
import TarjetaReserva from '../components/TarjetaReserva'
import { Aviso, Boton, Cargando, Entrada, Insignia, Paginador, Selector, Tarjeta, Titulo, Vacio } from '../components/ui'
import { compras } from '../api/servicios'
import { cargarCatalogo } from '../api/catalogos'
import { useSesion } from '../sesion/contexto'
import { dinero, fechaHora, legible, nombreCompleto, sinTildes } from '../util/formato'

const POR_PAGINA = 25
const ESTADOS = ['PENDIENTE', 'PAGADA', 'CONFIRMADA', 'CANCELADA', 'VENCIDA']
const CANALES = ['WEB', 'APP_MOVIL', 'TAQUILLA', 'AGENCIA']

function ReservasDeCliente({ codCliente }) {
  const navegar = useNavigate()
  const { elegirClienteTaquilla } = useSesion()
  const [estado, setEstado] = useState({ cargando: true, reservas: [], error: null })

  useEffect(() => {
    compras
      .misReservas(codCliente)
      .then((reservas) => setEstado({ cargando: false, reservas: [...reservas].sort((a, b) => b.fechaReserva.localeCompare(a.fechaReserva)), error: null }))
      .catch((error) => setEstado({ cargando: false, reservas: [], error }))
  }, [codCliente])

  const primera = estado.reservas[0]
  return (
    <div>
      <Link to="/panel/reservas" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-marca-700 hover:underline">
        <ArrowLeft className="size-4" />
        Todas las reservas
      </Link>
      <Titulo
        titulo={primera ? primera.cliente : `Cliente ${codCliente}`}
        descripcion={primera ? `${primera.emailCliente} · ${estado.reservas.length} reservas` : 'Reservas del cliente'}
        acciones={
          primera ? (
            <Boton
              icono={Store}
              onClick={() => {
                elegirClienteTaquilla({ codCliente: Number(codCliente), nombre: primera.cliente, documento: primera.tiquetes[0]?.documento ?? '', email: primera.emailCliente })
                navegar('/')
              }}
            >
              Vender a este cliente
            </Boton>
          ) : null
        }
      />
      {estado.cargando ? <Cargando /> : null}
      {estado.error ? <Aviso tipo="error" className="mt-4">{estado.error.message}</Aviso> : null}
      {!estado.cargando && !estado.reservas.length ? <Vacio icono={Ticket} titulo="Este cliente todavía no tiene reservas" /> : null}
      <div className="mt-5 space-y-3">
        {estado.reservas.map((reserva) => (
          <TarjetaReserva key={reserva.codReserva} reserva={reserva} />
        ))}
      </div>
    </div>
  )
}

function TodasLasReservas() {
  const navegar = useNavigate()
  const [estado, setEstado] = useState({ cargando: true, reservas: [], error: null })
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [canal, setCanal] = useState('')
  const [pagina, setPagina] = useState(1)

  const cargar = useCallback((refrescar = false) => {
    setEstado((actual) => ({ ...actual, cargando: true }))
    cargarCatalogo('/reservas', { refrescar })
      .then((reservas) => setEstado({ cargando: false, reservas: [...reservas].sort((a, b) => b.fechaReserva.localeCompare(a.fechaReserva)), error: null }))
      .catch((error) => setEstado({ cargando: false, reservas: [], error }))
  }, [])

  useEffect(() => {
    cargar(true)
  }, [cargar])

  const filtradas = useMemo(() => {
    const filtro = sinTildes(busqueda.trim())
    return estado.reservas.filter((reserva) => {
      if (filtroEstado && reserva.estado?.nombre !== filtroEstado) return false
      if (canal && reserva.canal !== canal) return false
      if (!filtro) return true
      const usuario = reserva.cliente?.usuario
      return sinTildes([reserva.codigoReserva, nombreCompleto(usuario), usuario?.email, usuario?.numeroDocumento, reserva.promocion?.codigo].join(' ')).includes(filtro)
    })
  }, [estado.reservas, busqueda, filtroEstado, canal])

  const visibles = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
  const cambiarFiltro = (accion) => (evento) => {
    accion(evento.target.value)
    setPagina(1)
  }

  return (
    <div>
      <Titulo
        titulo="Reservas"
        descripcion="Busca cualquier reserva para cobrarla, cancelarla, hacer el check-in o descargar sus documentos."
        acciones={
          <Boton variante="secundario" icono={RefreshCw} onClick={() => cargar(true)}>
            Actualizar
          </Boton>
        }
      />
      <Tarjeta className="mt-5">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3">
          <div className="relative min-w-64 max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Entrada value={busqueda} onChange={cambiarFiltro(setBusqueda)} placeholder="Código, cliente, correo, documento o promoción" className="pl-9" />
          </div>
          <Selector value={filtroEstado} onChange={cambiarFiltro(setFiltroEstado)} className="w-44">
            <option value="">Todos los estados</option>
            {ESTADOS.map((opcion) => (
              <option key={opcion} value={opcion}>
                {legible(opcion)}
              </option>
            ))}
          </Selector>
          <Selector value={canal} onChange={cambiarFiltro(setCanal)} className="w-40">
            <option value="">Todos los canales</option>
            {CANALES.map((opcion) => (
              <option key={opcion} value={opcion}>
                {legible(opcion)}
              </option>
            ))}
          </Selector>
          <span className="text-sm text-slate-500">{filtradas.length} reservas</span>
        </div>
        {estado.cargando ? <Cargando texto="Cargando reservas…" /> : null}
        {estado.error ? <Aviso tipo="error" className="m-3">{estado.error.message}</Aviso> : null}
        {!estado.cargando && !filtradas.length ? <Vacio icono={Ticket} titulo="No hay reservas con estos filtros" /> : null}
        {!estado.cargando && visibles.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Código</th>
                  <th className="px-4 py-2.5 font-semibold">Cliente</th>
                  <th className="px-4 py-2.5 font-semibold">Fecha</th>
                  <th className="px-4 py-2.5 font-semibold">Canal</th>
                  <th className="px-4 py-2.5 font-semibold">Estado</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibles.map((reserva) => (
                  <tr key={reserva.codReserva} className="cursor-pointer hover:bg-slate-50" onClick={() => navegar(`/reservas/${reserva.codReserva}`)}>
                    <td className="px-4 py-2.5 font-mono font-bold tracking-wider">{reserva.codigoReserva}</td>
                    <td className="px-4 py-2.5">
                      {nombreCompleto(reserva.cliente?.usuario)}
                      <span className="block text-xs text-slate-500">{reserva.cliente?.usuario?.email}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">{fechaHora(reserva.fechaReserva)}</td>
                    <td className="px-4 py-2.5">{legible(reserva.canal)}</td>
                    <td className="px-4 py-2.5">
                      <Insignia estado={reserva.estado?.nombre} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold">{dinero(reserva.total)}</td>
                    <td className="px-4 py-2 text-right">
                      <ArrowRight className="ml-auto size-4 text-slate-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <div className="px-3">
          <Paginador pagina={pagina} total={filtradas.length} porPagina={POR_PAGINA} alCambiar={setPagina} />
        </div>
      </Tarjeta>
    </div>
  )
}

export default function Reservas() {
  const [parametros] = useSearchParams()
  const cliente = parametros.get('cliente')
  return cliente ? <ReservasDeCliente key={cliente} codCliente={cliente} /> : <TodasLasReservas />
}

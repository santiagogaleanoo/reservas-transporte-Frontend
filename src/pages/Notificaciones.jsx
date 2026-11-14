import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgePercent, Bell, CalendarClock, CheckCheck, CircleCheck, Inbox, ScanLine, TriangleAlert, Ban } from 'lucide-react'
import { Aviso, Boton, Cargando, Insignia, Tarjeta, Vacio } from '../components/ui'
import { bandeja } from '../api/servicios'
import { useSesion } from '../sesion/contexto'
import { fechaHora, legible } from '../util/formato'

const ICONOS = {
  RECORDATORIO_VIAJE: CalendarClock,
  PROMOCION: BadgePercent,
  CAMBIO_VIAJE: TriangleAlert,
  CONFIRMACION_PAGO: CircleCheck,
  RESERVA_PENDIENTE: CalendarClock,
  RESERVA_CANCELADA: Ban,
  RESERVA_VENCIDA: Ban,
  CHECKIN: ScanLine,
}

export default function Notificaciones() {
  const { setNoLeidas } = useSesion()
  const [estado, setEstado] = useState({ cargando: true, avisos: [], error: null })
  const [filtro, setFiltro] = useState('todas')
  const [marcando, setMarcando] = useState(false)

  useEffect(() => {
    bandeja
      .listar()
      .then((avisos) => setEstado({ cargando: false, avisos, error: null }))
      .catch((error) => setEstado({ cargando: false, avisos: [], error }))
  }, [])

  useEffect(() => {
    setNoLeidas(estado.avisos.filter((aviso) => !aviso.leida).length)
  }, [estado.avisos, setNoLeidas])

  const visibles = useMemo(() => {
    const ordenados = [...estado.avisos].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
    if (filtro === 'sinLeer') return ordenados.filter((aviso) => !aviso.leida)
    if (filtro === 'promociones') return ordenados.filter((aviso) => aviso.tipo === 'PROMOCION')
    if (filtro === 'viajes') return ordenados.filter((aviso) => aviso.tipo !== 'PROMOCION')
    return ordenados
  }, [estado.avisos, filtro])

  const reemplazar = (actualizado) => setEstado((actual) => ({ ...actual, avisos: actual.avisos.map((aviso) => (aviso.codNotificacion === actualizado.codNotificacion ? actualizado : aviso)) }))

  const leer = async (aviso) => {
    if (aviso.leida) return
    try {
      reemplazar(await bandeja.leer(aviso.codNotificacion))
    } catch (error) {
      setEstado((actual) => ({ ...actual, error }))
    }
  }

  const leerTodas = async () => {
    setMarcando(true)
    try {
      await bandeja.leerTodas()
      setEstado({ cargando: false, avisos: await bandeja.listar(), error: null })
    } catch (error) {
      setEstado((actual) => ({ ...actual, error }))
    } finally {
      setMarcando(false)
    }
  }

  const sinLeer = estado.avisos.filter((aviso) => !aviso.leida).length

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-noche-900">Notificaciones</h1>
          <p className="text-sm text-slate-500">{sinLeer ? `Tienes ${sinLeer} sin leer` : 'Estás al día'}. También te las enviamos por correo.</p>
        </div>
        <Boton variante="secundario" icono={CheckCheck} cargando={marcando} disabled={!sinLeer} onClick={leerTodas}>
          Marcar todas como leídas
        </Boton>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ['todas', 'Todas'],
          ['sinLeer', 'Sin leer'],
          ['viajes', 'Mis viajes'],
          ['promociones', 'Promociones'],
        ].map(([clave, texto]) => (
          <button key={clave} type="button" onClick={() => setFiltro(clave)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${filtro === clave ? 'bg-noche-900 text-white ring-noche-900' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'}`}>
            {texto}
          </button>
        ))}
      </div>
      {estado.cargando ? <Cargando /> : null}
      {estado.error ? <Aviso tipo="error" className="mb-4">{estado.error.message}</Aviso> : null}
      {!estado.cargando && !visibles.length ? <Vacio icono={Inbox} titulo="No hay notificaciones aquí" /> : null}
      <div className="space-y-2">
        {visibles.map((aviso) => {
          const Icono = ICONOS[aviso.tipo] ?? Bell
          return (
            <Tarjeta key={aviso.codNotificacion} className={`flex gap-4 p-4 transition ${aviso.leida ? 'opacity-75' : 'cursor-pointer ring-marca-300 hover:shadow-md'}`} onClick={() => leer(aviso)}>
              <span className={`grid size-10 shrink-0 place-items-center rounded-full ${aviso.leida ? 'bg-slate-100 text-slate-500' : 'bg-marca-50 text-marca-700'}`}>
                <Icono className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`text-sm ${aviso.leida ? 'font-semibold' : 'font-bold'} text-slate-900`}>{aviso.titulo}</p>
                  {!aviso.leida ? <span className="size-2 rounded-full bg-amber-400" aria-label="Sin leer" /> : null}
                </div>
                <p className="mt-0.5 text-sm text-slate-600">{aviso.mensaje}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{legible(aviso.tipo)}</span>
                  <span>{fechaHora(aviso.fechaCreacion)}</span>
                  <Insignia estado={aviso.estado} />
                  {aviso.tipo === 'PROMOCION' ? (
                    <Link to="/#promociones" className="font-semibold text-marca-700 hover:underline">
                      Ver promociones
                    </Link>
                  ) : null}
                  {aviso.codViaje ? (
                    <Link to="/mis-viajes" className="font-semibold text-marca-700 hover:underline">
                      Ver mis viajes
                    </Link>
                  ) : null}
                </div>
              </div>
            </Tarjeta>
          )
        })}
      </div>
    </div>
  )
}

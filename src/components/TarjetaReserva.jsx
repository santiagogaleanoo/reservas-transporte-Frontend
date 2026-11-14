import { ArrowRight, CalendarClock, Luggage, ScanLine } from 'lucide-react'
import { BotonEnlace, Insignia, Tarjeta } from './ui'
import { dinero, falta, fecha, fechaHora, hora, legible } from '../util/formato'
import { APERTURA_CHECKIN_HORAS } from '../util/reglas'

export default function TarjetaReserva({ reserva }) {
  const primero = reserva.tiquetes[0]
  const horas = primero ? (new Date(primero.fechaHoraSalida) - new Date()) / 3600000 : -1
  const checkin = reserva.estado === 'PAGADA' && horas > 0 && horas <= APERTURA_CHECKIN_HORAS
  return (
    <Tarjeta className="overflow-hidden transition hover:shadow-md">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 md:w-72">
          <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-noche-900 text-center text-white">
            <span>
              <span className="block text-lg font-extrabold leading-none">{primero ? new Date(primero.fechaHoraSalida).getDate() : '—'}</span>
              <span className="block text-[11px] uppercase">{primero ? new Date(primero.fechaHoraSalida).toLocaleDateString('es-CO', { month: 'short' }) : ''}</span>
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900">
              {primero?.origen} → {primero?.destino}
            </p>
            <p className="text-sm text-slate-500">
              {primero ? `${fecha(primero.fechaHoraSalida, { year: undefined })} · ${hora(primero.fechaHoraSalida)}` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div>
            <p className="text-xs text-slate-500">Reserva</p>
            <p className="font-mono font-bold tracking-wider">{reserva.codigoReserva}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Viaje</p>
            <p className="font-semibold">{primero?.codigoViaje}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Viajeros</p>
            <p className="font-semibold">{reserva.tiquetes.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Clase</p>
            <p className="font-semibold">{legible(primero?.clase)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total</p>
            <p className="font-semibold">{dinero(reserva.total)}</p>
          </div>
          <Insignia estado={reserva.estado} />
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {reserva.estado === 'PENDIENTE' && horas > 0 ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-700">
              <CalendarClock className="size-4" />
              Pagar antes del {fechaHora(reserva.fechaLimitePago)}
            </span>
          ) : null}
          {checkin ? (
            <BotonEnlace to={`/reservas/${reserva.codReserva}/check-in`} tamano="sm" icono={ScanLine}>
              Check-in
            </BotonEnlace>
          ) : null}
          <BotonEnlace to={`/reservas/${reserva.codReserva}`} tamano="sm" variante="secundario">
            Ver detalle
            <ArrowRight className="size-4" />
          </BotonEnlace>
        </div>
      </div>
      {checkin ? (
        <div className="flex items-center gap-2 border-t border-marca-100 bg-marca-50 px-5 py-2 text-xs font-semibold text-marca-800">
          <Luggage className="size-4" />
          El check-in está abierto: tu viaje sale {falta(primero.fechaHoraSalida)}.
        </div>
      ) : null}
    </Tarjeta>
  )
}

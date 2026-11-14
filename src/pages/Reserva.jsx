import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Ban, CalendarClock, CreditCard, Receipt, ScanLine, UserRound } from 'lucide-react'
import BotonDescarga from '../components/BotonDescarga'
import FormularioPago from '../components/FormularioPago'
import { Aviso, Boton, BotonEnlace, Cargando, Dato, Insignia, Modal, Tarjeta } from '../components/ui'
import { compras, documentos } from '../api/servicios'
import { useCatalogo } from '../api/catalogos'
import { usePago } from '../hooks/usePago'
import { useSesion } from '../sesion/contexto'
import { dinero, falta, fecha, fechaHora, hora, legible } from '../util/formato'
import { APERTURA_CHECKIN_HORAS } from '../util/reglas'

function ModalPagar({ reserva, abierto, alCerrar, alPagar, esPersonal }) {
  const pago = usePago(esPersonal)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const pagar = async () => {
    if (!pago.datos) {
      setError('Elige el medio de pago')
      return
    }
    setEnviando(true)
    setError('')
    try {
      const actualizada = await compras.pagar(reserva.codReserva, pago.datos)
      alPagar(actualizada)
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={`Pagar la reserva ${reserva.codigoReserva}`}
      pie={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Ahora no
          </Boton>
          <Boton variante="acento" icono={CreditCard} cargando={enviando} onClick={pagar}>
            Pagar {dinero(reserva.total)}
          </Boton>
        </>
      }
    >
      <p className="mb-4 text-sm text-slate-600">
        Tienes hasta el <strong>{fechaHora(reserva.fechaLimitePago)}</strong> para pagar. Después las sillas se liberan.
      </p>
      <FormularioPago pago={pago} total={reserva.total} esPersonal={esPersonal} />
      {error ? <Aviso tipo="error" className="mt-4">{error}</Aviso> : null}
    </Modal>
  )
}

function ModalCancelar({ reserva, abierto, alCerrar, alCancelar, reembolsable }) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const cancelar = async () => {
    setEnviando(true)
    setError('')
    try {
      const actualizada = await compras.cancelar(reserva.codReserva)
      alCancelar(actualizada)
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="¿Cancelar la reserva?"
      pie={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Mantener reserva
          </Boton>
          <Boton variante="peligro" icono={Ban} cargando={enviando} onClick={cancelar}>
            Sí, cancelar
          </Boton>
        </>
      }
    >
      <p className="text-sm text-slate-700">
        Vas a cancelar la reserva <strong>{reserva.codigoReserva}</strong> con {reserva.tiquetes.length} {reserva.tiquetes.length === 1 ? 'tiquete' : 'tiquetes'}. Las sillas quedan libres para otros viajeros.
      </p>
      {reserva.estado === 'PAGADA' ? (
        <Aviso tipo={reembolsable ? 'info' : 'alerta'} className="mt-4">
          {reembolsable ? `Tu clase permite reembolso: se devuelven ${dinero(reserva.total)} al mismo medio de pago.` : 'La clase de este viaje no permite reembolso una vez pagada, así que es posible que no se pueda cancelar.'}
        </Aviso>
      ) : null}
      {error ? <Aviso tipo="error" className="mt-4">{error}</Aviso> : null}
    </Modal>
  )
}

export default function Reserva() {
  const { codReserva } = useParams()
  const ubicacion = useLocation()
  const { esPersonal } = useSesion()
  const clases = useCatalogo('/clases-servicio')
  const [estado, setEstado] = useState({ cargando: true, reserva: null, error: null })
  const [modal, setModal] = useState(null)
  const [mensaje, setMensaje] = useState(ubicacion.state?.creada ? 'creada' : null)

  const cargar = useCallback(() => {
    compras
      .consultar(codReserva)
      .then((reserva) => setEstado({ cargando: false, reserva, error: null }))
      .catch((error) => setEstado({ cargando: false, reserva: null, error }))
  }, [codReserva])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (estado.cargando) return <Cargando texto="Cargando la reserva…" className="py-24" />
  if (estado.error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Aviso tipo="error">{estado.error.message}</Aviso>
        <BotonEnlace to={esPersonal ? '/panel/reservas' : '/mis-viajes'} className="mt-4" variante="secundario" icono={ArrowLeft}>
          Volver
        </BotonEnlace>
      </div>
    )
  }

  const reserva = estado.reserva
  const primero = reserva.tiquetes[0]
  const salida = primero?.fechaHoraSalida
  const futuro = salida && new Date(salida) > new Date()
  const horasParaSalir = salida ? (new Date(salida) - new Date()) / 3600000 : 0
  const clase = clases.datos.find((opcion) => opcion.nombre === primero?.clase)
  const puedeCheckin = reserva.estado === 'PAGADA' && futuro
  const checkinAbierto = puedeCheckin && horasParaSalir <= APERTURA_CHECKIN_HORAS
  const puedeCancelar = ['PENDIENTE', 'PAGADA', 'CONFIRMADA'].includes(reserva.estado) && futuro

  const actualizar = (nueva, texto) => {
    setEstado({ cargando: false, reserva: nueva, error: null })
    setModal(null)
    setMensaje(texto)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const textoMensaje = {
    creada: reserva.estado === 'PAGADA' ? `¡Listo! Tu compra quedó pagada. Enviamos la factura ${reserva.numeroFactura ?? ''} a ${reserva.emailCliente}.` : `Tu reserva quedó guardada. Págala antes del ${fechaHora(reserva.fechaLimitePago)} para no perder las sillas.`,
    pagada: `Pago aprobado. La factura ${reserva.numeroFactura ?? ''} ya está disponible.`,
    cancelada: 'La reserva quedó cancelada y las sillas se liberaron.',
  }[mensaje]

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link to={esPersonal ? '/panel/reservas' : '/mis-viajes'} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-marca-700 hover:underline">
        <ArrowLeft className="size-4" />
        {esPersonal ? 'Reservas' : 'Mis viajes'}
      </Link>
      {textoMensaje ? (
        <Aviso tipo={mensaje === 'cancelada' ? 'info' : 'exito'} className="mb-4" alCerrar={() => setMensaje(null)}>
          {textoMensaje}
        </Aviso>
      ) : null}

      <Tarjeta className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 bg-noche-900 p-5 text-white sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-noche-200">Código de reserva</p>
            <p className="font-mono text-3xl font-extrabold tracking-widest">{reserva.codigoReserva}</p>
            <p className="mt-1 text-sm text-noche-200">
              Reservada el {fechaHora(reserva.fechaReserva)} por {legible(reserva.canal)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Insignia estado={reserva.estado} className="text-sm" />
            {reserva.estado === 'PENDIENTE' ? (
              <p className="flex items-center gap-1 text-sm text-amber-200">
                <CalendarClock className="size-4" />
                Paga antes del {fechaHora(reserva.fechaLimitePago)} ({falta(reserva.fechaLimitePago)})
              </p>
            ) : null}
          </div>
        </div>
        {primero ? (
          <div className="grid gap-4 border-b border-slate-200 p-5 sm:grid-cols-[1fr_auto] sm:p-6">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-extrabold">{hora(primero.fechaHoraSalida)}</p>
                <p className="text-sm font-semibold text-slate-600">{primero.origen}</p>
              </div>
              <ArrowRight className="size-5 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-500">{fecha(primero.fechaHoraSalida)}</p>
                <p className="text-sm font-semibold text-slate-600">{primero.destino}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Dato etiqueta="Viaje">{primero.codigoViaje}</Dato>
              <Dato etiqueta="Clase">{legible(primero.clase)}</Dato>
              <Dato etiqueta="Sale">{futuro ? falta(primero.fechaHoraSalida) : 'Ya salió'}</Dato>
            </dl>
          </div>
        ) : null}
        {(reserva.estado === 'PENDIENTE' && futuro) || puedeCheckin || reserva.numeroFactura || puedeCancelar ? (
          <div className="flex flex-wrap gap-2 p-5 sm:px-6">
            {reserva.estado === 'PENDIENTE' && futuro ? (
              <Boton variante="acento" icono={CreditCard} onClick={() => setModal('pagar')}>
                Pagar {dinero(reserva.total)}
              </Boton>
            ) : null}
            {puedeCheckin ? (
              <BotonEnlace to={`/reservas/${reserva.codReserva}/check-in`} variante={checkinAbierto ? 'primario' : 'secundario'} icono={ScanLine}>
                {checkinAbierto ? 'Hacer check-in' : 'Check-in y equipaje'}
              </BotonEnlace>
            ) : null}
            {reserva.numeroFactura ? (
              <BotonDescarga tamano="md" icono={Receipt} accion={() => documentos.factura(reserva.codReserva, reserva.numeroFactura)}>
                Factura {reserva.numeroFactura}
              </BotonDescarga>
            ) : null}
            {puedeCancelar ? (
              <Boton variante="fantasma" className="text-rose-600 hover:bg-rose-50 sm:ml-auto" icono={Ban} onClick={() => setModal('cancelar')}>
                Cancelar reserva
              </Boton>
            ) : null}
          </div>
        ) : null}
        {puedeCheckin && !checkinAbierto ? <p className="px-5 pb-5 text-xs text-slate-500 sm:px-6">El check-in en línea abre {APERTURA_CHECKIN_HORAS} horas antes de la salida.</p> : null}
      </Tarjeta>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Tarjeta>
            <p className="border-b border-slate-200 px-5 py-4 font-bold text-noche-900">Viajeros y tiquetes</p>
            <div className="divide-y divide-slate-100">
              {reserva.tiquetes.map((tiquete) => (
                <div key={tiquete.codTiquete} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <span className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500">
                    <UserRound className="size-5" />
                  </span>
                  <div className="min-w-40 flex-1">
                    <p className="font-semibold text-slate-900">{tiquete.pasajero}</p>
                    <p className="text-xs text-slate-500">
                      {tiquete.documento} · {legible(tiquete.tipoPasajero)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-slate-500">Silla</p>
                    <p className="font-bold">{tiquete.numeroAsiento ?? '—'}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-slate-500">Tiquete</p>
                    <p className="font-mono font-semibold">{tiquete.numeroTiquete}</p>
                  </div>
                  <div className="text-right text-sm">
                    <Insignia estado={tiquete.estado} />
                    <p className="mt-1 font-semibold">{dinero(tiquete.precioPagado)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Tarjeta>

          <Tarjeta>
            <p className="border-b border-slate-200 px-5 py-4 font-bold text-noche-900">Pagos</p>
            {reserva.pagos.length ? (
              <div className="divide-y divide-slate-100">
                {reserva.pagos.map((pago) => (
                  <div key={pago.codPago} className="flex flex-wrap items-center gap-4 px-5 py-4 text-sm">
                    <div className="min-w-40 flex-1">
                      <p className="font-semibold">{pago.metodo}</p>
                      <p className="text-xs text-slate-500">
                        {fechaHora(pago.fechaPago)} · Ref. {pago.referenciaTransaccion}
                        {pago.cuotas ? ` · ${pago.cuotas} cuotas` : ''}
                      </p>
                    </div>
                    <Insignia estado={pago.estado} />
                    <p className="w-28 text-right font-bold">{dinero(pago.monto)}</p>
                    <BotonDescarga accion={() => documentos.comprobante(pago.codPago)}>Comprobante</BotonDescarga>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-6 text-sm text-slate-500">Aún no hay pagos registrados.</p>
            )}
          </Tarjeta>
        </div>

        <Tarjeta className="h-fit p-5">
          <p className="mb-3 font-bold text-noche-900">Resumen</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Subtotal</dt>
              <dd>{dinero(reserva.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-emerald-700">
              <dt>Descuento {reserva.codigoPromocion ? `(${reserva.codigoPromocion})` : ''}</dt>
              <dd>-{dinero(reserva.descuento)}</dd>
            </div>
            <div className="flex items-end justify-between border-t border-slate-100 pt-2">
              <dt className="font-bold">Total</dt>
              <dd className="text-xl font-extrabold text-noche-900">{dinero(reserva.total)}</dd>
            </div>
          </dl>
          <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4">
            <Dato etiqueta="Cliente">
              {reserva.cliente}
              <span className="block text-xs font-normal text-slate-500">{reserva.emailCliente}</span>
            </Dato>
            {reserva.empleado ? <Dato etiqueta="Atendido por">{reserva.empleado}</Dato> : null}
            {reserva.numeroFactura ? <Dato etiqueta="Factura">{reserva.numeroFactura}</Dato> : null}
          </dl>
        </Tarjeta>
      </div>

      <ModalPagar reserva={reserva} abierto={modal === 'pagar'} alCerrar={() => setModal(null)} alPagar={(nueva) => actualizar(nueva, 'pagada')} esPersonal={esPersonal} />
      <ModalCancelar reserva={reserva} abierto={modal === 'cancelar'} alCerrar={() => setModal(null)} alCancelar={(nueva) => actualizar(nueva, 'cancelada')} reembolsable={clase?.permiteReembolso} />
    </div>
  )
}

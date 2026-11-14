import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Armchair, ArrowLeft, BaggageClaim, CircleCheck, Clock, DoorOpen, Luggage, Plus, ScanLine, Ticket, Trash, UserRound } from 'lucide-react'
import BotonDescarga from '../components/BotonDescarga'
import FormularioPago from '../components/FormularioPago'
import MapaAsientos from '../components/MapaAsientos'
import { Aviso, Boton, Campo, Cargando, Dato, Entrada, Insignia, Modal, Selector, Tarjeta } from '../components/ui'
import { abordaje, compras, documentos } from '../api/servicios'
import { usePago } from '../hooks/usePago'
import { useSesion } from '../sesion/contexto'
import { cifra, dinero, falta, fecha, fechaHora, hora, legible } from '../util/formato'
import { EQUIPAJE, estimarEquipaje } from '../util/reglas'

const PIEZA_VACIA = { tipo: 'BODEGA', pesoKg: '', dimensionesCm: '' }

function ModalSilla({ abierto, alCerrar, pasajero, codViaje, elegidas, alElegir }) {
  const [mapa, setMapa] = useState({ cargando: true, asientos: [], error: null })
  const [seleccion, setSeleccion] = useState(null)

  useEffect(() => {
    if (!abierto) return undefined
    let vigente = true
    setSeleccion(elegidas[pasajero.codTiquete] ?? pasajero.numeroAsiento)
    compras
      .asientos(codViaje)
      .then((datos) => vigente && setMapa({ cargando: false, asientos: datos.asientos, error: null }))
      .catch((error) => vigente && setMapa({ cargando: false, asientos: [], error }))
    return () => {
      vigente = false
    }
  }, [abierto, codViaje, pasajero, elegidas])

  const otros = Object.fromEntries(Object.entries(elegidas).filter(([codigo]) => Number(codigo) !== pasajero.codTiquete).map(([, numero]) => [numero, '●']))

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      ancho="max-w-2xl"
      titulo={`Silla de ${pasajero.pasajero}`}
      pie={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton
            onClick={() => {
              alElegir(seleccion && seleccion !== pasajero.numeroAsiento ? seleccion : null)
              alCerrar()
            }}
          >
            Usar silla {seleccion ?? pasajero.numeroAsiento}
          </Boton>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-600">
        Tu silla actual es la <strong>{pasajero.numeroAsiento ?? 'sin asignar'}</strong>. Puedes cambiarla por otra libre de clase {legible(pasajero.clase)}.
      </p>
      {mapa.cargando ? <Cargando /> : null}
      {mapa.error ? <Aviso tipo="error">{mapa.error.message}</Aviso> : null}
      {!mapa.cargando && !mapa.error ? (
        <MapaAsientos
          asientos={mapa.asientos}
          nombreClase={pasajero.clase}
          ocupadosPorOtros={otros}
          seleccion={seleccion}
          permitirOcupado={(numero) => numero === pasajero.numeroAsiento}
          alElegir={(numero) => setSeleccion(numero ?? pasajero.numeroAsiento)}
        />
      ) : null}
    </Modal>
  )
}

function ModalEquipaje({ abierto, alCerrar, pasajero, alRegistrar, esPersonal }) {
  const [piezas, setPiezas] = useState([{ ...PIEZA_VACIA }])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const pago = usePago(esPersonal)
  const estimado = estimarEquipaje(pasajero.equipajes, piezas, pasajero.equipajeIncluidoKg)

  const cambiar = (posicion, campo, valor) => setPiezas((lista) => lista.map((pieza, indice) => (indice === posicion ? { ...pieza, [campo]: valor } : pieza)))

  const registrar = async () => {
    setError('')
    if (estimado.error) {
      setError(estimado.error)
      return
    }
    const malas = piezas.find((pieza) => pieza.dimensionesCm && !/^\d{1,3}x\d{1,3}x\d{1,3}$/.test(pieza.dimensionesCm.trim()))
    if (malas) {
      setError('Escribe las dimensiones como largo x ancho x alto, por ejemplo 55x40x20')
      return
    }
    if (estimado.total > 0 && !pago.datos) {
      setError('El equipaje tiene costo: elige el medio de pago')
      return
    }
    setEnviando(true)
    try {
      const resultado = await abordaje.equipaje(pasajero.codTiquete, {
        piezas: piezas.map((pieza) => ({ tipo: pieza.tipo, pesoKg: Number(pieza.pesoKg), dimensionesCm: pieza.dimensionesCm.trim() || null })),
        codMetodo: estimado.total > 0 ? pago.datos.codMetodo : null,
        cuotas: estimado.total > 0 ? pago.datos.cuotas : null,
      })
      setPiezas([{ ...PIEZA_VACIA }])
      alRegistrar(resultado)
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
      ancho="max-w-2xl"
      titulo={`Equipaje de ${pasajero.pasajero}`}
      pie={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton variante={estimado.total > 0 ? 'acento' : 'primario'} cargando={enviando} onClick={registrar} icono={BaggageClaim}>
            {estimado.total > 0 ? `Registrar y pagar ${dinero(estimado.total)}` : 'Registrar equipaje'}
          </Boton>
        </>
      }
    >
      <Aviso tipo="info" className="mb-4">
        Tu clase {legible(pasajero.clase)} incluye una maleta de bodega de hasta {cifra(pasajero.equipajeIncluidoKg)} kg. El equipaje de mano (máx. {EQUIPAJE.maximoManoKg} kg) no tiene costo. Cada kilo de más vale {dinero(EQUIPAJE.costoKgExceso)} y cada pieza adicional {dinero(EQUIPAJE.costoPiezaAdicional)}.
      </Aviso>
      <div className="space-y-3">
        {piezas.map((pieza, posicion) => (
          <div key={posicion} className="grid gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 sm:grid-cols-[minmax(0,1fr)_96px_128px_150px] sm:items-end">
            <Campo etiqueta={`Pieza ${pasajero.equipajes.length + posicion + 1}`}>
              <Selector value={pieza.tipo} onChange={(evento) => cambiar(posicion, 'tipo', evento.target.value)}>
                <option value="BODEGA">Maleta de bodega</option>
                <option value="MANO">Equipaje de mano</option>
                <option value="ESPECIAL">Especial (bicicleta, instrumento…)</option>
              </Selector>
            </Campo>
            <Campo etiqueta="Peso (kg)">
              <Entrada type="number" min="0.1" max="32" step="0.1" value={pieza.pesoKg} onChange={(evento) => cambiar(posicion, 'pesoKg', evento.target.value)} />
            </Campo>
            <Campo etiqueta="Medidas (cm)">
              <Entrada value={pieza.dimensionesCm} placeholder="55x40x20" onChange={(evento) => cambiar(posicion, 'dimensionesCm', evento.target.value)} />
            </Campo>
            <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
              <span className="text-right text-xs">
                <span className="block font-bold text-slate-900">{dinero(estimado.detalle[posicion]?.costo ?? 0)}</span>
                <span className="block text-slate-500">{estimado.detalle[posicion]?.nota}</span>
              </span>
              {piezas.length > 1 ? (
                <button type="button" onClick={() => setPiezas((lista) => lista.filter((_, indice) => indice !== posicion))} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600" aria-label="Quitar pieza">
                  <Trash className="size-4" />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <Boton variante="fantasma" tamano="sm" className="mt-2" icono={Plus} onClick={() => setPiezas((lista) => [...lista, { ...PIEZA_VACIA }])}>
        Agregar otra pieza
      </Boton>
      {estimado.total > 0 ? (
        <div className="mt-4 rounded-xl p-4 ring-1 ring-slate-200">
          <p className="mb-3 text-sm font-bold">Pago del equipaje: {dinero(estimado.total)}</p>
          <FormularioPago pago={pago} total={estimado.total} esPersonal={esPersonal} />
        </div>
      ) : null}
      {error ? <Aviso tipo="error" className="mt-4">{error}</Aviso> : null}
    </Modal>
  )
}

function FilaPasajero({ pasajero, estado, elegido, alElegir, sillaNueva, alCambiarSilla, alEquipaje, puedeEquipaje }) {
  const pendiente = !pasajero.checkinHecho && pasajero.estadoTiquete === 'EMITIDO'
  return (
    <div className="p-5">
      <div className="flex flex-wrap items-center gap-4">
        {pendiente && estado.disponible ? (
          <input type="checkbox" className="size-5 accent-marca-600" checked={elegido} onChange={(evento) => alElegir(evento.target.checked)} aria-label={`Incluir a ${pasajero.pasajero}`} />
        ) : (
          <span className={`grid size-5 place-items-center rounded-full ${pasajero.checkinHecho ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>{pasajero.checkinHecho ? <CircleCheck className="size-4" /> : null}</span>
        )}
        <span className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-500">
          <UserRound className="size-5" />
        </span>
        <div className="min-w-40 flex-1">
          <p className="font-semibold text-slate-900">{pasajero.pasajero}</p>
          <p className="text-xs text-slate-500">
            {legible(pasajero.tipoPasajero)} · {legible(pasajero.clase)} · Tiquete {pasajero.numeroTiquete}
          </p>
        </div>
        <div className="text-sm">
          <p className="text-xs text-slate-500">Silla</p>
          <p className="font-bold">
            {sillaNueva ? (
              <>
                <span className="text-slate-400 line-through">{pasajero.numeroAsiento}</span> {sillaNueva}
              </>
            ) : (
              pasajero.numeroAsiento ?? '—'
            )}
          </p>
        </div>
        {pasajero.checkinHecho ? (
          <div className="text-sm">
            <p className="text-xs text-slate-500">Pase</p>
            <p className="font-mono font-semibold">
              {pasajero.codigoPaseAbordar}
              {pasajero.grupoAbordaje ? <span className="ml-2 rounded bg-noche-900 px-1.5 text-xs text-white">Grupo {pasajero.grupoAbordaje}</span> : null}
            </p>
          </div>
        ) : (
          <Insignia estado={pasajero.estadoTiquete} />
        )}
        <div className="flex flex-wrap gap-2">
          {pendiente && estado.disponible ? (
            <Boton variante="secundario" tamano="sm" icono={Armchair} onClick={alCambiarSilla}>
              Cambiar silla
            </Boton>
          ) : null}
          {pasajero.checkinHecho ? (
            <>
              <BotonDescarga accion={() => abordaje.pase(pasajero.codTiquete)} icono={Ticket}>
                Pase
              </BotonDescarga>
              {puedeEquipaje ? (
                <Boton variante="secundario" tamano="sm" icono={Luggage} onClick={alEquipaje}>
                  Equipaje
                </Boton>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
      {pasajero.checkinHecho ? <p className="mt-2 pl-9 text-xs text-slate-500">Check-in el {fechaHora(pasajero.fechaCheckin)} por {legible(pasajero.canal)}</p> : null}
      {pasajero.equipajes.length ? (
        <div className="mt-3 overflow-x-auto pl-9">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="py-1 pr-3 font-semibold">Pieza</th>
                <th className="py-1 pr-3 font-semibold">Etiqueta</th>
                <th className="py-1 pr-3 font-semibold">Tipo</th>
                <th className="py-1 pr-3 font-semibold">Peso</th>
                <th className="py-1 pr-3 font-semibold">Medidas</th>
                <th className="py-1 pr-3 font-semibold">Costo</th>
                <th className="py-1 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pasajero.equipajes.map((pieza) => (
                <tr key={pieza.numeroPieza}>
                  <td className="py-1.5 pr-3">{pieza.numeroPieza}</td>
                  <td className="py-1.5 pr-3 font-mono">{pieza.codigoEtiqueta}</td>
                  <td className="py-1.5 pr-3">{legible(pieza.tipo)}</td>
                  <td className="py-1.5 pr-3">{cifra(pieza.pesoKg)} kg</td>
                  <td className="py-1.5 pr-3">{pieza.dimensionesCm ?? '—'}</td>
                  <td className="py-1.5 pr-3">{dinero(pieza.costoAdicional)}</td>
                  <td className="py-1.5">
                    <Insignia estado={pieza.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

export default function CheckIn() {
  const { codReserva } = useParams()
  const { esPersonal } = useSesion()
  const [estado, setEstado] = useState({ cargando: true, datos: null, error: null })
  const [elegidos, setElegidos] = useState({})
  const [sillas, setSillas] = useState({})
  const [canal, setCanal] = useState(esPersonal ? 'MOSTRADOR' : 'WEB')
  const [modalSilla, setModalSilla] = useState(null)
  const [modalEquipaje, setModalEquipaje] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(null)

  const aplicar = (datos) => {
    setEstado({ cargando: false, datos, error: null })
    const pendientes = datos.pasajeros.filter((pasajero) => !pasajero.checkinHecho && pasajero.estadoTiquete === 'EMITIDO')
    setElegidos(Object.fromEntries(pendientes.map((pasajero) => [pasajero.codTiquete, true])))
    setSillas({})
  }

  const cargar = useCallback(() => {
    abordaje
      .estado(codReserva)
      .then(aplicar)
      .catch((error) => setEstado({ cargando: false, datos: null, error }))
  }, [codReserva])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (estado.cargando) return <Cargando texto="Consultando el check-in…" className="py-24" />
  if (estado.error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Aviso tipo="error">{estado.error.message}</Aviso>
        <Link to={`/reservas/${codReserva}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-marca-700 hover:underline">
          <ArrowLeft className="size-4" />
          Volver a la reserva
        </Link>
      </div>
    )
  }

  const datos = estado.datos
  const seleccionados = datos.pasajeros.filter((pasajero) => elegidos[pasajero.codTiquete] && !pasajero.checkinHecho)
  const conCheckin = datos.pasajeros.filter((pasajero) => pasajero.checkinHecho)
  const equipajeAbierto = new Date(datos.cierraCheckin) > new Date() && ['PROGRAMADO', 'RETRASADO'].includes(datos.estadoViaje)
  const canales = esPersonal ? ['MOSTRADOR', 'KIOSCO', 'WEB', 'APP_MOVIL'] : ['WEB', 'APP_MOVIL', 'KIOSCO']

  const hacerCheckin = async () => {
    setError('')
    setExito(null)
    if (!seleccionados.length) {
      setError('Elige al menos un viajero')
      return
    }
    setEnviando(true)
    try {
      const respuesta = await abordaje.hacer(datos.codReserva, {
        canal,
        pasajeros: seleccionados.map((pasajero) => ({ codTiquete: pasajero.codTiquete, numeroAsiento: sillas[pasajero.codTiquete] ?? null })),
      })
      aplicar(respuesta)
      setExito({ tipo: 'checkin', cantidad: seleccionados.length })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link to={`/reservas/${datos.codReserva}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-marca-700 hover:underline">
        <ArrowLeft className="size-4" />
        Reserva {datos.codigoReserva}
      </Link>

      {exito?.tipo === 'checkin' ? (
        <Aviso tipo="exito" className="mb-4" titulo={`Check-in listo para ${exito.cantidad} ${exito.cantidad === 1 ? 'viajero' : 'viajeros'}`} alCerrar={() => setExito(null)}>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span>Te enviamos los pases por correo. También puedes descargarlos aquí.</span>
            <BotonDescarga accion={() => abordaje.pases(datos.codReserva, datos.codigoReserva)} icono={Ticket} variante="primario">
              Descargar pases
            </BotonDescarga>
          </div>
        </Aviso>
      ) : null}
      {exito?.tipo === 'equipaje' ? (
        <Aviso tipo="exito" className="mb-4" titulo={`Equipaje registrado para ${exito.datos.pasajero}`} alCerrar={() => setExito(null)}>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span>
              {exito.datos.registradas.length} {exito.datos.registradas.length === 1 ? 'pieza' : 'piezas'} · costo {dinero(exito.datos.costoTotal)}
              {exito.datos.referenciaPago ? ` · pago ${exito.datos.referenciaPago}` : ''}
            </span>
            {exito.datos.codPago ? <BotonDescarga accion={() => documentos.comprobante(exito.datos.codPago)}>Comprobante</BotonDescarga> : null}
          </div>
        </Aviso>
      ) : null}

      <Tarjeta className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 bg-noche-900 p-5 text-white sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-noche-200">Check-in · {datos.codigoViaje}</p>
            <p className="text-2xl font-extrabold">
              {datos.origen} → {datos.destino}
            </p>
            <p className="mt-1 text-sm text-noche-200">
              {fecha(datos.salida)} · sale a las {hora(datos.salida)} ({falta(datos.salida)})
            </p>
          </div>
          <Insignia estado={datos.estadoViaje} className="text-sm" />
        </div>
        <dl className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 sm:p-6">
          <Dato etiqueta="Abordaje desde">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-4 text-slate-400" />
              {hora(datos.abordaje)}
            </span>
          </Dato>
          <Dato etiqueta="Puerta o andén">
            <span className="inline-flex items-center gap-1">
              <DoorOpen className="size-4 text-slate-400" />
              {datos.puertaAnden ?? 'Por confirmar'}
            </span>
          </Dato>
          <Dato etiqueta="Abre">{fechaHora(datos.abreCheckin)}</Dato>
          <Dato etiqueta="Cierra">{fechaHora(datos.cierraCheckin)}</Dato>
        </dl>
        {!datos.disponible && datos.motivo ? (
          <div className="px-5 pb-5 sm:px-6">
            <Aviso tipo={datos.pasajeros.length > 0 && conCheckin.length === datos.pasajeros.length ? 'exito' : 'alerta'}>{datos.motivo}</Aviso>
          </div>
        ) : null}
      </Tarjeta>

      <Tarjeta className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <p className="font-bold text-noche-900">Viajeros</p>
          {conCheckin.length ? (
            <BotonDescarga accion={() => abordaje.pases(datos.codReserva, datos.codigoReserva)} icono={Ticket}>
              Todos los pases ({conCheckin.length})
            </BotonDescarga>
          ) : null}
        </div>
        <div className="divide-y divide-slate-100">
          {datos.pasajeros.map((pasajero) => (
            <FilaPasajero
              key={pasajero.codTiquete}
              pasajero={pasajero}
              estado={datos}
              elegido={Boolean(elegidos[pasajero.codTiquete])}
              alElegir={(valor) => setElegidos((actual) => ({ ...actual, [pasajero.codTiquete]: valor }))}
              sillaNueva={sillas[pasajero.codTiquete]}
              alCambiarSilla={() => setModalSilla(pasajero)}
              alEquipaje={() => setModalEquipaje(pasajero)}
              puedeEquipaje={equipajeAbierto && pasajero.estadoTiquete === 'EMITIDO'}
            />
          ))}
        </div>
        {datos.disponible && datos.pasajeros.some((pasajero) => !pasajero.checkinHecho && pasajero.estadoTiquete === 'EMITIDO') ? (
          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4">
            <Campo etiqueta="Canal" className="w-48">
              <Selector value={canal} onChange={(evento) => setCanal(evento.target.value)}>
                {canales.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {legible(opcion)}
                  </option>
                ))}
              </Selector>
            </Campo>
            <div className="flex flex-col items-end gap-2">
              {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
              <Boton tamano="lg" icono={ScanLine} cargando={enviando} onClick={hacerCheckin} disabled={!seleccionados.length}>
                Hacer check-in ({seleccionados.length})
              </Boton>
            </div>
          </div>
        ) : null}
      </Tarjeta>

      {modalSilla ? (
        <ModalSilla
          abierto
          alCerrar={() => setModalSilla(null)}
          pasajero={modalSilla}
          codViaje={datos.codViaje}
          elegidas={sillas}
          alElegir={(numero) => setSillas((actual) => {
            const copia = { ...actual }
            if (numero) copia[modalSilla.codTiquete] = numero
            else delete copia[modalSilla.codTiquete]
            return copia
          })}
        />
      ) : null}
      {modalEquipaje ? (
        <ModalEquipaje
          abierto
          alCerrar={() => setModalEquipaje(null)}
          pasajero={modalEquipaje}
          esPersonal={esPersonal}
          alRegistrar={(resultado) => {
            setModalEquipaje(null)
            setExito({ tipo: 'equipaje', datos: resultado })
            cargar()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      ) : null}
    </div>
  )
}

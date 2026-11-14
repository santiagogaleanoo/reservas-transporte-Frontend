import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Armchair, ArrowLeft, ArrowRight, BusFront, CalendarClock, Check, CreditCard, Plane, Tag, UserRound } from 'lucide-react'
import MapaAsientos from '../components/MapaAsientos'
import FormularioPago from '../components/FormularioPago'
import { usePago } from '../hooks/usePago'
import { Aviso, Boton, BotonEnlace, Campo, Cargando, Entrada, Selector, Tarjeta } from '../components/ui'
import { compras } from '../api/servicios'
import { useCatalogo } from '../api/catalogos'
import { useSesion } from '../sesion/contexto'
import { aConsulta, viajeRecordado } from '../util/busqueda'
import { cifra, dinero, duracion, fecha, fechaCorta, fechaHora, hora, hoyIso, legible } from '../util/formato'
import { limitePagoEstimado, puedeReservarSinPago, tipoSegunEdad } from '../util/reglas'

const PASOS = ['Viajeros', 'Sillas', 'Pago']

const VIAJERO_VACIO = {
  siglaTipoDocumento: 'CC',
  numeroDocumento: '',
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  fechaNacimiento: '',
  genero: '',
  codigoPais: 'COL',
  numeroAsiento: null,
}

function validarViajeros(viajeros, salida) {
  const errores = viajeros.map((viajero) => {
    const faltas = {}
    if (!viajero.numeroDocumento.trim()) faltas.numeroDocumento = 'Escribe el número de documento'
    if (!viajero.primerNombre.trim()) faltas.primerNombre = 'Escribe el primer nombre'
    if (!viajero.primerApellido.trim()) faltas.primerApellido = 'Escribe el primer apellido'
    if (!viajero.fechaNacimiento) faltas.fechaNacimiento = 'Elige la fecha de nacimiento'
    else if (viajero.fechaNacimiento >= hoyIso()) faltas.fechaNacimiento = 'Debe ser una fecha pasada'
    return faltas
  })
  const documentos = viajeros.map((viajero) => `${viajero.siglaTipoDocumento}-${viajero.numeroDocumento.trim()}`)
  documentos.forEach((documento, posicion) => {
    if (viajeros[posicion].numeroDocumento.trim() && documentos.indexOf(documento) !== posicion) {
      errores[posicion].numeroDocumento = 'Este documento ya está en otro viajero'
    }
  })
  const tipos = viajeros.map((viajero) => tipoSegunEdad(viajero.fechaNacimiento, salida))
  const general = tipos.some((tipo) => tipo === 'NINO' || tipo === 'INFANTE') && !tipos.includes('ADULTO') ? 'Los niños e infantes deben viajar con al menos un adulto en la misma reserva' : null
  const valido = !general && errores.every((faltas) => !Object.keys(faltas).length)
  return { errores, general, valido }
}

function ResumenViaje({ viaje, clase, cantidad, promocion, total, descuento, subtotal }) {
  const Icono = viaje.tipoTransporte === 'AEREO' ? Plane : BusFront
  return (
    <Tarjeta className="p-5 lg:sticky lg:top-24">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-noche-50 text-noche-700">
          <Icono className="size-5" />
        </span>
        <div>
          <p className="font-bold text-slate-900">{viaje.empresa}</p>
          <p className="text-xs text-slate-500">
            {viaje.codigoViaje} · {viaje.vehiculo}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
        <div>
          <p className="text-lg font-extrabold">{hora(viaje.fechaHoraSalida)}</p>
          <p className="text-xs text-slate-500">{viaje.ciudadOrigen}</p>
        </div>
        <ArrowRight className="size-4 text-slate-400" />
        <div>
          <p className="text-lg font-extrabold">{hora(viaje.fechaHoraLlegada)}</p>
          <p className="text-xs text-slate-500">{viaje.ciudadDestino}</p>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        {fecha(viaje.fechaHoraSalida)} · {duracion(viaje.duracionMin)}
      </p>
      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Clase</span>
          <span className="font-semibold">{legible(clase.nombre)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Tarifa por viajero</span>
          <span>{dinero(clase.precioBase)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Impuestos por viajero</span>
          <span>{dinero(clase.impuestos)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">
            {cantidad} × {dinero(clase.precioTotal)}
          </span>
          <span>{dinero(subtotal)}</span>
        </div>
        {promocion ? (
          <div className="flex justify-between text-emerald-700">
            <span>
              Promoción {promocion.codigo} (-{cifra(promocion.porcentajeDescuento)}%)
            </span>
            <span>-{dinero(descuento)}</span>
          </div>
        ) : null}
        <div className="flex items-end justify-between border-t border-slate-100 pt-3">
          <span className="font-bold">Total</span>
          <span className="text-2xl font-extrabold text-noche-900">{dinero(total)}</span>
        </div>
      </div>
      <ul className="mt-4 space-y-1 text-xs text-slate-500">
        <li>Equipaje de bodega incluido: {cifra(clase.equipajeIncluidoKg)} kg por viajero.</li>
        <li>{clase.permiteCambios ? 'Permite cambios.' : 'No permite cambios.'}</li>
        <li>{clase.permiteReembolso ? 'Reembolsable si cancelas antes de salir.' : 'No reembolsable una vez pagada.'}</li>
      </ul>
    </Tarjeta>
  )
}

function FormularioViajero({ numero, viajero, errores, tiposDocumento, paises, salida, alCambiar }) {
  const tipo = tipoSegunEdad(viajero.fechaNacimiento, salida)
  const cambiar = (campo) => (evento) => alCambiar({ ...viajero, [campo]: evento.target.value })
  return (
    <Tarjeta className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 font-bold text-noche-900">
          <UserRound className="size-5 text-marca-600" />
          Viajero {numero}
        </p>
        {tipo ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{legible(tipo)}</span> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Campo etiqueta="Tipo de documento" requerido>
          <Selector value={viajero.siglaTipoDocumento} onChange={cambiar('siglaTipoDocumento')}>
            {tiposDocumento.map((tipoDocumento) => (
              <option key={tipoDocumento.codTipo} value={tipoDocumento.sigla}>
                {tipoDocumento.nombre} ({tipoDocumento.sigla})
              </option>
            ))}
          </Selector>
        </Campo>
        <Campo etiqueta="Número de documento" requerido error={errores.numeroDocumento}>
          <Entrada value={viajero.numeroDocumento} onChange={cambiar('numeroDocumento')} maxLength={20} invalido={errores.numeroDocumento} inputMode="numeric" />
        </Campo>
        <Campo etiqueta="Nacionalidad">
          <Selector value={viajero.codigoPais} onChange={cambiar('codigoPais')}>
            {paises.map((pais) => (
              <option key={pais.codPais} value={pais.codigoIso}>
                {pais.nombre}
              </option>
            ))}
          </Selector>
        </Campo>
        <Campo etiqueta="Primer nombre" requerido error={errores.primerNombre}>
          <Entrada value={viajero.primerNombre} onChange={cambiar('primerNombre')} maxLength={40} invalido={errores.primerNombre} autoComplete="given-name" />
        </Campo>
        <Campo etiqueta="Segundo nombre">
          <Entrada value={viajero.segundoNombre} onChange={cambiar('segundoNombre')} maxLength={40} />
        </Campo>
        <Campo etiqueta="Fecha de nacimiento" requerido error={errores.fechaNacimiento}>
          <Entrada type="date" value={viajero.fechaNacimiento} max={hoyIso()} onChange={cambiar('fechaNacimiento')} invalido={errores.fechaNacimiento} />
        </Campo>
        <Campo etiqueta="Primer apellido" requerido error={errores.primerApellido}>
          <Entrada value={viajero.primerApellido} onChange={cambiar('primerApellido')} maxLength={40} invalido={errores.primerApellido} autoComplete="family-name" />
        </Campo>
        <Campo etiqueta="Segundo apellido">
          <Entrada value={viajero.segundoApellido} onChange={cambiar('segundoApellido')} maxLength={40} />
        </Campo>
        <Campo etiqueta="Género">
          <Selector value={viajero.genero} onChange={cambiar('genero')}>
            <option value="">Prefiero no decirlo</option>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
          </Selector>
        </Campo>
      </div>
      <p className="mt-3 text-xs text-slate-500">Si el viajero ya compró antes con este documento, usamos los datos que tenemos registrados.</p>
    </Tarjeta>
  )
}

export default function Compra() {
  const { codViaje } = useParams()
  const [parametros] = useSearchParams()
  const ubicacion = useLocation()
  const navegar = useNavigate()
  const { esPersonal, clienteTaquilla } = useSesion()
  const recordado = ubicacion.state?.viaje ? ubicacion.state : viajeRecordado(codViaje)
  const viaje = recordado?.viaje
  const consulta = recordado?.consulta
  const codClase = Number(parametros.get('clase'))
  const cantidad = Math.min(9, Math.max(1, Number(parametros.get('pasajeros') ?? 1)))
  const clase = viaje?.clases.find((opcion) => opcion.codClase === codClase)

  const tiposDocumento = useCatalogo('/tipos-documento')
  const paises = useCatalogo('/paises')
  const promociones = useCatalogo('/promociones')

  const [paso, setPaso] = useState(0)
  const [viajeros, setViajeros] = useState(() => Array.from({ length: cantidad }, () => ({ ...VIAJERO_VACIO })))
  const [validacion, setValidacion] = useState({ errores: [], general: null })
  const [mapa, setMapa] = useState({ cargando: true, asientos: [], error: null })
  const [activo, setActivo] = useState(0)
  const [codigoPromo, setCodigoPromo] = useState('')
  const [promocion, setPromocion] = useState(null)
  const [mensajePromo, setMensajePromo] = useState('')
  const [modoPago, setModoPago] = useState('ahora')
  const [canal, setCanal] = useState('TAQUILLA')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const codViajeElegido = viaje?.codViaje
  useEffect(() => {
    if (!codViajeElegido) return undefined
    let vigente = true
    compras
      .asientos(codViajeElegido)
      .then((datos) => vigente && setMapa({ cargando: false, asientos: datos.asientos, error: null }))
      .catch((fallo) => vigente && setMapa({ cargando: false, asientos: [], error: fallo }))
    return () => {
      vigente = false
    }
  }, [codViajeElegido])

  const pago = usePago(esPersonal)

  if (!viaje || !clase) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Aviso tipo="alerta" titulo="No encontramos el viaje que elegiste">
          Vuelve a la búsqueda y elige de nuevo el viaje y la clase.
        </Aviso>
        <BotonEnlace to="/" className="mt-4" icono={ArrowLeft}>
          Ir a buscar
        </BotonEnlace>
      </div>
    )
  }

  const subtotal = clase.precioTotal * cantidad
  const descuento = promocion ? Math.round((subtotal * Number(promocion.porcentajeDescuento)) / 100) : 0
  const total = subtotal - descuento
  const sinPagoPosible = puedeReservarSinPago(viaje.fechaHoraSalida)
  const faltaCliente = esPersonal && !clienteTaquilla

  const ocupadosPorOtros = Object.fromEntries(
    viajeros.map((viajero, posicion) => [viajero.numeroAsiento, posicion]).filter(([numero, posicion]) => numero && posicion !== activo).map(([numero, posicion]) => [numero, `V${posicion + 1}`]),
  )

  const continuarViajeros = () => {
    const resultado = validarViajeros(viajeros, viaje.fechaHoraSalida)
    setValidacion(resultado)
    if (resultado.valido) {
      setPaso(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const aplicarPromo = () => {
    const codigo = codigoPromo.trim().toUpperCase()
    if (!codigo) {
      setPromocion(null)
      setMensajePromo('')
      return
    }
    const encontrada = promociones.datos.find((opcion) => opcion.codigo.toUpperCase() === codigo)
    const hoy = hoyIso()
    if (!encontrada) {
      setPromocion(null)
      setMensajePromo(`No existe la promoción ${codigo}`)
    } else if (hoy < encontrada.fechaInicio || hoy > encontrada.fechaFin) {
      setPromocion(null)
      setMensajePromo(`La promoción ${encontrada.codigo} solo es válida del ${fechaCorta(encontrada.fechaInicio)} al ${fechaCorta(encontrada.fechaFin)}`)
    } else {
      setPromocion(encontrada)
      setMensajePromo('')
    }
  }

  const confirmar = async () => {
    setError(null)
    if (modoPago === 'ahora' && !pago.datos) {
      setError({ message: 'Elige el medio de pago' })
      return
    }
    setEnviando(true)
    try {
      const reserva = await compras.comprar({
        codViaje: viaje.codViaje,
        codClase: clase.codClase,
        codCliente: esPersonal ? clienteTaquilla.codCliente : undefined,
        codigoPromocion: promocion?.codigo,
        canal: esPersonal ? canal : 'WEB',
        pasajeros: viajeros.map((viajero) => ({
          siglaTipoDocumento: viajero.siglaTipoDocumento,
          numeroDocumento: viajero.numeroDocumento.trim(),
          primerNombre: viajero.primerNombre.trim(),
          segundoNombre: viajero.segundoNombre.trim() || null,
          primerApellido: viajero.primerApellido.trim(),
          segundoApellido: viajero.segundoApellido.trim() || null,
          fechaNacimiento: viajero.fechaNacimiento,
          genero: viajero.genero || null,
          codigoPais: viajero.codigoPais,
          numeroAsiento: viajero.numeroAsiento,
        })),
        pago: modoPago === 'ahora' ? pago.datos : null,
      })
      navegar(`/reservas/${reserva.codReserva}`, { state: { creada: true }, replace: true })
    } catch (fallo) {
      setError(fallo)
      setEnviando(false)
    }
  }

  const volverBusqueda = consulta ? `/buscar?${aConsulta(consulta)}` : '/'

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Link to={volverBusqueda} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-marca-700 hover:underline">
        <ArrowLeft className="size-4" />
        Volver a los resultados
      </Link>
      <ol className="mb-6 flex items-center gap-2 text-sm">
        {PASOS.map((nombre, posicion) => (
          <li key={nombre} className="flex items-center gap-2">
            <span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${posicion < paso ? 'bg-marca-600 text-white' : posicion === paso ? 'bg-noche-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {posicion < paso ? <Check className="size-4" /> : posicion + 1}
            </span>
            <span className={`font-semibold ${posicion === paso ? 'text-noche-900' : 'text-slate-500'}`}>{nombre}</span>
            {posicion < PASOS.length - 1 ? <span className="mx-1 h-px w-8 bg-slate-300 sm:w-16" /> : null}
          </li>
        ))}
      </ol>
      {faltaCliente ? (
        <Aviso tipo="alerta" className="mb-4" titulo="Falta elegir el cliente">
          Estás vendiendo en taquilla. <Link to="/panel/taquilla" className="font-semibold underline">Elige o registra al cliente</Link> antes de confirmar la compra.
        </Aviso>
      ) : null}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {paso === 0 ? (
            <>
              {validacion.general ? <Aviso tipo="error">{validacion.general}</Aviso> : null}
              {viajeros.map((viajero, posicion) => (
                <FormularioViajero
                  key={posicion}
                  numero={posicion + 1}
                  viajero={viajero}
                  errores={validacion.errores[posicion] ?? {}}
                  tiposDocumento={tiposDocumento.datos}
                  paises={paises.datos}
                  salida={viaje.fechaHoraSalida}
                  alCambiar={(nuevo) => setViajeros((lista) => lista.map((actual, indice) => (indice === posicion ? nuevo : actual)))}
                />
              ))}
              <div className="flex justify-end">
                <Boton tamano="lg" onClick={continuarViajeros}>
                  Continuar a sillas
                  <ArrowRight className="size-4" />
                </Boton>
              </div>
            </>
          ) : null}

          {paso === 1 ? (
            <Tarjeta className="p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-bold text-noche-900">
                    <Armchair className="size-5 text-marca-600" />
                    Elige las sillas
                  </p>
                  <p className="text-sm text-slate-500">Solo puedes elegir sillas de clase {legible(clase.nombre)}. Si no eliges, te asignamos una al confirmar.</p>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {viajeros.map((viajero, posicion) => (
                  <button
                    key={posicion}
                    type="button"
                    onClick={() => setActivo(posicion)}
                    className={`rounded-xl px-3 py-2 text-left text-sm ring-1 ${activo === posicion ? 'bg-noche-900 text-white ring-noche-900' : 'bg-white ring-slate-200 hover:ring-slate-300'}`}
                  >
                    <span className="block font-bold">
                      V{posicion + 1} · {viajero.primerNombre || `Viajero ${posicion + 1}`}
                    </span>
                    <span className="block text-xs opacity-80">{viajero.numeroAsiento ? `Silla ${viajero.numeroAsiento}` : 'Asignación automática'}</span>
                  </button>
                ))}
              </div>
              {mapa.cargando ? <Cargando texto="Cargando el mapa de sillas…" /> : null}
              {mapa.error ? <Aviso tipo="error">{mapa.error.message}</Aviso> : null}
              {!mapa.cargando && !mapa.error ? (
                <MapaAsientos
                  asientos={mapa.asientos}
                  codClase={clase.codClase}
                  ocupadosPorOtros={ocupadosPorOtros}
                  seleccion={viajeros[activo]?.numeroAsiento}
                  alElegir={(numero) => {
                    setViajeros((lista) => lista.map((viajero, indice) => (indice === activo ? { ...viajero, numeroAsiento: numero } : viajero)))
                    if (numero && activo < viajeros.length - 1) setActivo(activo + 1)
                  }}
                />
              ) : null}
              <div className="mt-5 flex justify-between gap-2">
                <Boton variante="secundario" onClick={() => setPaso(0)} icono={ArrowLeft}>
                  Viajeros
                </Boton>
                <Boton tamano="lg" onClick={() => setPaso(2)}>
                  Continuar al pago
                  <ArrowRight className="size-4" />
                </Boton>
              </div>
            </Tarjeta>
          ) : null}

          {paso === 2 ? (
            <>
              <Tarjeta className="p-5">
                <p className="mb-3 flex items-center gap-2 font-bold text-noche-900">
                  <Tag className="size-5 text-marca-600" />
                  Código de promoción
                </p>
                <div className="flex gap-2">
                  <Entrada value={codigoPromo} onChange={(evento) => setCodigoPromo(evento.target.value.toUpperCase())} placeholder="Ej. NAVIDAD25" maxLength={15} className="font-mono uppercase" />
                  <Boton variante="secundario" onClick={aplicarPromo}>
                    Aplicar
                  </Boton>
                </div>
                {mensajePromo ? <p className="mt-2 text-sm font-medium text-rose-600">{mensajePromo}</p> : null}
                {promocion ? (
                  <p className="mt-2 text-sm font-medium text-emerald-700">
                    {promocion.descripcion}: {cifra(promocion.porcentajeDescuento)}% de descuento.{' '}
                    <button type="button" className="underline" onClick={() => { setPromocion(null); setCodigoPromo('') }}>
                      Quitar
                    </button>
                  </p>
                ) : null}
              </Tarjeta>

              <Tarjeta className="p-5">
                <p className="mb-3 flex items-center gap-2 font-bold text-noche-900">
                  <CreditCard className="size-5 text-marca-600" />
                  ¿Cómo quieres pagar?
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={`cursor-pointer rounded-xl p-4 ring-1 ${modoPago === 'ahora' ? 'bg-marca-50 ring-2 ring-marca-500' : 'ring-slate-200'}`}>
                    <input type="radio" name="modo" className="sr-only" checked={modoPago === 'ahora'} onChange={() => setModoPago('ahora')} />
                    <span className="block font-bold">Pagar ahora</span>
                    <span className="block text-sm text-slate-500">Recibes la factura y los tiquetes al instante.</span>
                  </label>
                  <label className={`rounded-xl p-4 ring-1 ${!sinPagoPosible ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${modoPago === 'despues' ? 'bg-marca-50 ring-2 ring-marca-500' : 'ring-slate-200'}`}>
                    <input type="radio" name="modo" className="sr-only" disabled={!sinPagoPosible} checked={modoPago === 'despues'} onChange={() => setModoPago('despues')} />
                    <span className="block font-bold">Reservar y pagar después</span>
                    <span className="block text-sm text-slate-500">
                      {sinPagoPosible ? `Guardamos las sillas hasta el ${fechaHora(limitePagoEstimado(viaje.fechaHoraSalida))}.` : 'El viaje sale en menos de 3 horas, así que se paga de una vez.'}
                    </span>
                  </label>
                </div>

                {modoPago === 'ahora' ? (
                  <div className="mt-4">
                    <FormularioPago pago={pago} total={total} esPersonal={esPersonal} />
                  </div>
                ) : (
                  <Aviso tipo="info" className="mt-4">
                    Te enviamos un correo con el código de la reserva. Si no pagas antes del plazo, las sillas se liberan solas.
                  </Aviso>
                )}

                {esPersonal ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Campo etiqueta="Canal de venta">
                      <Selector value={canal} onChange={(evento) => setCanal(evento.target.value)}>
                        <option value="TAQUILLA">Taquilla</option>
                        <option value="AGENCIA">Agencia</option>
                      </Selector>
                    </Campo>
                    <Campo etiqueta="Cliente">
                      <Entrada value={clienteTaquilla ? `${clienteTaquilla.nombre} · ${clienteTaquilla.documento}` : 'Sin elegir'} disabled />
                    </Campo>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-slate-500">Entorno de prueba: el pago se registra como aprobado sin cobrar dinero real.</p>
                )}
              </Tarjeta>

              {error ? <Aviso tipo="error" titulo="No se pudo completar la compra">{error.message}</Aviso> : null}

              <div className="flex flex-wrap justify-between gap-2">
                <Boton variante="secundario" onClick={() => setPaso(1)} icono={ArrowLeft}>
                  Sillas
                </Boton>
                <Boton tamano="lg" variante="acento" cargando={enviando} disabled={faltaCliente} onClick={confirmar} icono={modoPago === 'ahora' ? CreditCard : CalendarClock}>
                  {modoPago === 'ahora' ? `Pagar ${dinero(total)}` : 'Confirmar reserva'}
                </Boton>
              </div>
            </>
          ) : null}
        </div>
        <ResumenViaje viaje={viaje} clase={clase} cantidad={cantidad} promocion={promocion} total={total} descuento={descuento} subtotal={subtotal} />
      </div>
    </div>
  )
}

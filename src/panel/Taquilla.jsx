import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ScanLine, Search, Store, Ticket, UserPlus, UserRound } from 'lucide-react'
import FormularioRegistro from '../components/FormularioRegistro'
import { Aviso, Boton, Cargando, Entrada, Modal, Tarjeta, Titulo } from '../components/ui'
import { cargarCatalogo, olvidarCatalogo, useCatalogo } from '../api/catalogos'
import { useSesion } from '../sesion/contexto'
import { nombreCompleto, sinTildes } from '../util/formato'

function claveAleatoria() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const valores = crypto.getRandomValues(new Uint32Array(10))
  return `${Array.from(valores, (valor) => letras[valor % letras.length]).join('')}*`
}

function aClienteTaquilla(cliente) {
  return {
    codCliente: cliente.codCliente,
    nombre: nombreCompleto(cliente.usuario),
    documento: `${cliente.usuario?.tipoDocumento?.sigla ?? ''} ${cliente.usuario?.numeroDocumento ?? ''}`.trim(),
    email: cliente.usuario?.email,
  }
}

export default function Taquilla() {
  const navegar = useNavigate()
  const { clienteTaquilla, elegirClienteTaquilla } = useSesion()
  const clientes = useCatalogo('/clientes')
  const [busqueda, setBusqueda] = useState('')
  const [registrar, setRegistrar] = useState(false)
  const [clave] = useState(claveAleatoria)
  const [creado, setCreado] = useState(null)
  const [codigo, setCodigo] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [errorCodigo, setErrorCodigo] = useState('')

  const resultados = useMemo(() => {
    const filtro = sinTildes(busqueda.trim())
    if (filtro.length < 2) return []
    return clientes.datos
      .filter((cliente) => sinTildes([nombreCompleto(cliente.usuario), cliente.usuario?.numeroDocumento, cliente.usuario?.email, cliente.usuario?.telefono].join(' ')).includes(filtro))
      .slice(0, 12)
  }, [clientes.datos, busqueda])

  const vender = (cliente) => {
    elegirClienteTaquilla(aClienteTaquilla(cliente))
    navegar('/')
  }

  const buscarReserva = async (destino) => {
    const texto = codigo.trim().toUpperCase()
    if (!texto) {
      setErrorCodigo('Escribe el código de la reserva')
      return
    }
    setBuscando(true)
    setErrorCodigo('')
    try {
      const reservas = await cargarCatalogo('/reservas', { refrescar: true })
      const encontrada = reservas.find((reserva) => reserva.codigoReserva === texto || String(reserva.codReserva) === texto)
      if (!encontrada) setErrorCodigo(`No existe una reserva con el código ${texto}`)
      else navegar(destino === 'checkin' ? `/reservas/${encontrada.codReserva}/check-in` : `/reservas/${encontrada.codReserva}`)
    } catch (fallo) {
      setErrorCodigo(fallo.message)
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div className="space-y-6">
      <Titulo titulo="Taquilla y mostrador" descripcion="Vende tiquetes a nombre de un cliente, recibe pagos en efectivo y haz el check-in en el mostrador." />

      {clienteTaquilla ? (
        <Aviso tipo="info" titulo={`Venta en curso para ${clienteTaquilla.nombre}`}>
          <div className="mt-2 flex flex-wrap gap-2">
            <Boton tamano="sm" icono={Search} onClick={() => navegar('/')}>
              Buscar viajes para este cliente
            </Boton>
            <Boton tamano="sm" variante="secundario" icono={Ticket} onClick={() => navegar(`/panel/reservas?cliente=${clienteTaquilla.codCliente}`)}>
              Ver sus reservas
            </Boton>
            <Boton tamano="sm" variante="fantasma" onClick={() => elegirClienteTaquilla(null)}>
              Terminar venta
            </Boton>
          </div>
        </Aviso>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Tarjeta className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-bold text-noche-900">
              <Store className="size-5 text-marca-600" />
              Vender a un cliente
            </p>
            <Boton variante="secundario" tamano="sm" icono={UserPlus} onClick={() => setRegistrar(true)}>
              Registrar cliente nuevo
            </Boton>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Entrada value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Busca por nombre, documento, correo o teléfono" className="pl-9" autoFocus />
          </div>
          {creado ? (
            <Aviso tipo="exito" className="mt-4" titulo={`Cliente ${creado.nombre} registrado`}>
              Su contraseña temporal es <strong className="font-mono">{creado.clave}</strong>. Entrégasela para que pueda entrar y ver sus viajes.
            </Aviso>
          ) : null}
          {clientes.cargando ? <Cargando /> : null}
          {clientes.error ? <Aviso tipo="error" className="mt-4">{clientes.error.message}</Aviso> : null}
          {busqueda.trim().length >= 2 && !resultados.length && !clientes.cargando ? <p className="mt-4 text-sm text-slate-500">No hay clientes que coincidan. Puedes registrarlo como cliente nuevo.</p> : null}
          <ul className="mt-4 divide-y divide-slate-100">
            {resultados.map((cliente) => (
              <li key={cliente.codCliente} className="flex flex-wrap items-center gap-3 py-3">
                <span className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500">
                  <UserRound className="size-4" />
                </span>
                <div className="min-w-48 flex-1">
                  <p className="font-semibold text-slate-900">{nombreCompleto(cliente.usuario)}</p>
                  <p className="text-xs text-slate-500">
                    {cliente.usuario?.tipoDocumento?.sigla} {cliente.usuario?.numeroDocumento} · {cliente.usuario?.email}
                  </p>
                </div>
                <Boton tamano="sm" variante="secundario" onClick={() => navegar(`/panel/reservas?cliente=${cliente.codCliente}`)}>
                  Reservas
                </Boton>
                <Boton tamano="sm" onClick={() => vender(cliente)}>
                  Vender
                  <ArrowRight className="size-4" />
                </Boton>
              </li>
            ))}
          </ul>
          {busqueda.trim().length < 2 ? <p className="mt-4 text-sm text-slate-500">Escribe al menos dos letras o números para buscar entre {clientes.datos.length} clientes.</p> : null}
        </Tarjeta>

        <Tarjeta className="h-fit p-5">
          <p className="mb-1 flex items-center gap-2 font-bold text-noche-900">
            <ScanLine className="size-5 text-marca-600" />
            Check-in en mostrador
          </p>
          <p className="mb-4 text-sm text-slate-500">Escribe el código de la reserva que trae el pasajero.</p>
          <form
            onSubmit={(evento) => {
              evento.preventDefault()
              buscarReserva('checkin')
            }}
            className="space-y-3"
          >
            <Entrada value={codigo} onChange={(evento) => setCodigo(evento.target.value.toUpperCase())} placeholder="Ej. ALGK4S" maxLength={10} className="font-mono text-lg uppercase tracking-widest" />
            {errorCodigo ? <p className="text-sm font-medium text-rose-600">{errorCodigo}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Boton type="submit" icono={ScanLine} cargando={buscando}>
                Hacer check-in
              </Boton>
              <Boton variante="secundario" onClick={() => buscarReserva('detalle')} disabled={buscando}>
                Ver reserva
              </Boton>
            </div>
          </form>
        </Tarjeta>
      </div>

      <Modal abierto={registrar} alCerrar={() => setRegistrar(false)} ancho="max-w-2xl" titulo="Registrar cliente nuevo">
        <FormularioRegistro
          contrasenaSugerida={clave}
          textoBoton="Registrar y vender"
          alRegistrar={async (usuario, cuerpo) => {
            olvidarCatalogo('/clientes')
            const nuevo = { codCliente: usuario.codUsuario, nombre: `${usuario.primerNombre} ${usuario.primerApellido}`, documento: `${cuerpo.siglaTipoDocumento} ${cuerpo.numeroDocumento}`, email: usuario.email }
            elegirClienteTaquilla(nuevo)
            setCreado({ nombre: nuevo.nombre, clave: cuerpo.password })
            setRegistrar(false)
          }}
        />
      </Modal>
    </div>
  )
}

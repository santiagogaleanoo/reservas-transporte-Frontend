import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Database, Pencil, Plus, RefreshCw, Search, Trash } from 'lucide-react'
import { Aviso, Boton, Cargando, Entrada, Modal, Paginador, Tarjeta, Titulo, Vacio } from '../components/ui'
import ModalEntidad from './ModalEntidad'
import { api } from '../api/servicios'
import { cargarCatalogo, olvidarCatalogo } from '../api/catalogos'
import { useSesion } from '../sesion/contexto'
import { sinTildes } from '../util/formato'
import { ENTIDADES, GRUPOS, puedeEscribir } from './entidades'

const POR_PAGINA = 25

function TablaEntidad({ entidad }) {
  const { esAdmin } = useSesion()
  const navegar = useNavigate()
  const [estado, setEstado] = useState({ cargando: true, filas: [], error: null })
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [editar, setEditar] = useState(undefined)
  const [borrar, setBorrar] = useState(null)
  const [borrando, setBorrando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const escribe = puedeEscribir(entidad, esAdmin)

  const cargar = useCallback(
    (refrescar = false) => {
      setEstado((actual) => ({ ...actual, cargando: true }))
      cargarCatalogo(entidad.ruta, { refrescar })
        .then((filas) => setEstado({ cargando: false, filas: filas ?? [], error: null }))
        .catch((error) => setEstado({ cargando: false, filas: [], error }))
    },
    [entidad.ruta],
  )

  useEffect(() => {
    setBusqueda('')
    setPagina(1)
    setMensaje(null)
    cargar()
  }, [cargar])

  const filtradas = useMemo(() => {
    const filtro = sinTildes(busqueda.trim())
    if (!filtro) return estado.filas
    return estado.filas.filter((fila) => sinTildes(entidad.columnas.map((columna) => columna.valor(fila)).join(' ')).includes(filtro))
  }, [estado.filas, busqueda, entidad])

  const visibles = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const alGuardar = (_guardado, editando) => {
    setEditar(undefined)
    setMensaje({ tipo: 'exito', texto: editando ? 'Cambios guardados' : 'Registro agregado' })
    olvidarCatalogo(entidad.ruta)
    cargar(true)
  }

  const eliminar = async () => {
    setBorrando(true)
    try {
      await api.eliminar(`${entidad.ruta}/${entidad.id(borrar)}`)
      setBorrar(null)
      setMensaje({ tipo: 'exito', texto: 'Registro eliminado' })
      cargar(true)
    } catch (fallo) {
      setBorrar(null)
      setMensaje({ tipo: 'error', texto: fallo.estado === 409 ? 'No se puede eliminar porque otros registros dependen de este' : fallo.message })
    } finally {
      setBorrando(false)
    }
  }

  return (
    <div>
      <Titulo
        titulo={entidad.titulo}
        descripcion={entidad.soloLectura ? 'Solo consulta: estos registros se crean desde la compra, el pago y el check-in.' : escribe ? 'Consulta, agrega, edita y elimina registros.' : 'Tu rol solo puede consultar esta tabla.'}
        acciones={
          <>
            <Boton variante="secundario" icono={RefreshCw} onClick={() => cargar(true)}>
              Actualizar
            </Boton>
            {escribe ? (
              <Boton icono={Plus} onClick={() => setEditar(null)}>
                Agregar
              </Boton>
            ) : null}
          </>
        }
      />
      {mensaje ? (
        <Aviso tipo={mensaje.tipo} className="mt-4" alCerrar={() => setMensaje(null)}>
          {mensaje.texto}
        </Aviso>
      ) : null}
      <Tarjeta className="mt-4">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Entrada
              value={busqueda}
              onChange={(evento) => {
                setBusqueda(evento.target.value)
                setPagina(1)
              }}
              placeholder="Buscar en la tabla"
              className="pl-9"
            />
          </div>
          <span className="text-sm text-slate-500">{filtradas.length} registros</span>
        </div>
        {estado.cargando ? <Cargando texto={entidad.pesado ? 'Cargando… esta tabla es grande' : 'Cargando…'} /> : null}
        {estado.error ? <Aviso tipo="error" className="m-3">{estado.error.message}</Aviso> : null}
        {!estado.cargando && !estado.error && !filtradas.length ? <Vacio icono={Database} titulo="No hay registros" /> : null}
        {!estado.cargando && visibles.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {entidad.columnas.map((columna) => (
                    <th key={columna.titulo} className="whitespace-nowrap px-4 py-2.5 font-semibold">
                      {columna.titulo}
                    </th>
                  ))}
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibles.map((fila) => (
                  <tr key={entidad.id(fila)} className="hover:bg-slate-50">
                    {entidad.columnas.map((columna) => (
                      <td key={columna.titulo} className="max-w-xs truncate px-4 py-2.5 text-slate-700">
                        {columna.valor(fila) ?? '—'}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-2 text-right">
                      {entidad.enlace ? (
                        <Boton variante="fantasma" tamano="sm" onClick={() => navegar(entidad.enlace(fila))}>
                          Ver
                          <ArrowRight className="size-4" />
                        </Boton>
                      ) : null}
                      {escribe ? (
                        <Boton variante="fantasma" tamano="sm" icono={Pencil} onClick={() => setEditar(fila)} aria-label="Editar">
                          Editar
                        </Boton>
                      ) : null}
                      {escribe && esAdmin ? (
                        <Boton variante="fantasma" tamano="sm" className="text-rose-600 hover:bg-rose-50" icono={Trash} onClick={() => setBorrar(fila)} aria-label="Eliminar" />
                      ) : null}
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
      {editar !== undefined ? <ModalEntidad key={editar ? entidad.id(editar) : 'nuevo'} entidad={entidad} fila={editar} abierto alCerrar={() => setEditar(undefined)} alGuardar={alGuardar} /> : null}
      <Modal
        abierto={Boolean(borrar)}
        alCerrar={() => setBorrar(null)}
        titulo="¿Eliminar el registro?"
        pie={
          <>
            <Boton variante="secundario" onClick={() => setBorrar(null)}>
              Cancelar
            </Boton>
            <Boton variante="peligro" cargando={borrando} onClick={eliminar}>
              Eliminar
            </Boton>
          </>
        }
      >
        <p className="text-sm text-slate-700">Esta acción no se puede deshacer. Si otros registros dependen de este, la base de datos no dejará eliminarlo.</p>
      </Modal>
    </div>
  )
}

export default function Datos() {
  const { clave } = useParams()
  const { esAdmin } = useSesion()
  const disponibles = ENTIDADES.filter((entidad) => esAdmin || !entidad.soloAdmin)
  const entidad = disponibles.find((opcion) => opcion.clave === clave)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
      <nav className="desplazable flex gap-4 overflow-x-auto xl:block xl:space-y-5 xl:overflow-visible">
        {GRUPOS.map((grupo) => {
          const lista = disponibles.filter((opcion) => opcion.grupo === grupo)
          if (!lista.length) return null
          return (
            <div key={grupo} className="shrink-0">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">{grupo}</p>
              <ul className="flex gap-1 xl:block xl:space-y-0.5">
                {lista.map((opcion) => (
                  <li key={opcion.clave}>
                    <NavLink
                      to={`/panel/datos/${opcion.clave}`}
                      className={({ isActive }) => `block whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-marca-50 font-semibold text-marca-800' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {opcion.titulo}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>
      <div className="min-w-0">
        {entidad ? (
          <TablaEntidad key={entidad.clave} entidad={entidad} />
        ) : (
          <Tarjeta>
            <Vacio icono={Database} titulo="Datos del sistema">
              Elige una tabla para consultar y mantener sus registros. Las reservas, pagos y tiquetes se crean desde la compra; aquí solo se consultan.{' '}
              <Link to="/panel/datos/viajes" className="font-semibold text-marca-700 hover:underline">
                Empezar por los viajes
              </Link>
            </Vacio>
          </Tarjeta>
        )}
      </div>
    </div>
  )
}

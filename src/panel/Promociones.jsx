import { useCallback, useEffect, useState } from 'react'
import { BadgePercent, Pencil, Plus, Send, Trash } from 'lucide-react'
import ModalEntidad from './ModalEntidad'
import { ENTIDADES } from './entidades'
import { Aviso, Boton, Cargando, Insignia, Modal, Tarjeta, Titulo, Vacio } from '../components/ui'
import { api, avisos } from '../api/servicios'
import { cargarCatalogo, olvidarCatalogo } from '../api/catalogos'
import { useSesion } from '../sesion/contexto'
import { cifra, fechaCorta, hoyIso } from '../util/formato'

const ENTIDAD = ENTIDADES.find((entidad) => entidad.clave === 'promociones')

function estadoDe(promocion) {
  const hoy = hoyIso()
  if (promocion.fechaFin < hoy) return 'VENCIDA'
  if (promocion.fechaInicio > hoy) return 'PROGRAMADA'
  return 'VIGENTE'
}

export default function Promociones() {
  const { esAdmin } = useSesion()
  const [estado, setEstado] = useState({ cargando: true, lista: [], error: null })
  const [editar, setEditar] = useState(undefined)
  const [borrar, setBorrar] = useState(null)
  const [enviar, setEnviar] = useState(null)
  const [trabajando, setTrabajando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const cargar = useCallback((refrescar = false) => {
    cargarCatalogo('/promociones', { refrescar })
      .then((lista) => setEstado({ cargando: false, lista: [...lista].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio)), error: null }))
      .catch((error) => setEstado({ cargando: false, lista: [], error }))
  }, [])

  useEffect(() => {
    cargar(true)
  }, [cargar])

  const confirmarEnvio = async () => {
    setTrabajando(true)
    try {
      const resultado = await avisos.enviarPromocion(enviar.codPromocion)
      setMensaje({ tipo: 'exito', texto: `La promoción ${resultado.promocion} se envió a ${resultado.destinatarios} clientes que aceptan notificaciones.` })
    } catch (fallo) {
      setMensaje({ tipo: 'error', texto: fallo.message })
    } finally {
      setEnviar(null)
      setTrabajando(false)
    }
  }

  const confirmarBorrado = async () => {
    setTrabajando(true)
    try {
      await api.eliminar(`/promociones/${borrar.codPromocion}`)
      setMensaje({ tipo: 'exito', texto: `Promoción ${borrar.codigo} eliminada` })
      olvidarCatalogo('/promociones')
      cargar(true)
    } catch (fallo) {
      setMensaje({ tipo: 'error', texto: fallo.estado === 409 ? 'No se puede eliminar porque ya hay reservas o notificaciones con esta promoción' : fallo.message })
    } finally {
      setBorrar(null)
      setTrabajando(false)
    }
  }

  return (
    <div>
      <Titulo
        titulo="Promociones"
        descripcion={esAdmin ? 'Crea códigos de descuento y envíalos por correo a los clientes.' : 'Envía por correo las promociones vigentes a los clientes.'}
        acciones={
          esAdmin ? (
            <Boton icono={Plus} onClick={() => setEditar(null)}>
              Nueva promoción
            </Boton>
          ) : null
        }
      />
      {mensaje ? (
        <Aviso tipo={mensaje.tipo} className="mt-4" alCerrar={() => setMensaje(null)}>
          {mensaje.texto}
        </Aviso>
      ) : null}
      {estado.cargando ? <Cargando /> : null}
      {estado.error ? <Aviso tipo="error" className="mt-4">{estado.error.message}</Aviso> : null}
      {!estado.cargando && !estado.lista.length ? <Vacio icono={BadgePercent} titulo="No hay promociones" /> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {estado.lista.map((promocion) => {
          const situacion = estadoDe(promocion)
          return (
            <Tarjeta key={promocion.codPromocion} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-lg font-extrabold tracking-wider text-noche-900">{promocion.codigo}</p>
                  <p className="text-sm text-slate-500">{promocion.descripcion}</p>
                </div>
                <p className="text-3xl font-extrabold text-marca-700">-{cifra(promocion.porcentajeDescuento)}%</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <Insignia estado={situacion} />
                <span>
                  {fechaCorta(promocion.fechaInicio)} al {fechaCorta(promocion.fechaFin)}
                </span>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <Boton tamano="sm" icono={Send} disabled={situacion === 'VENCIDA'} onClick={() => setEnviar(promocion)}>
                  Enviar a clientes
                </Boton>
                {esAdmin ? (
                  <>
                    <Boton tamano="sm" variante="secundario" icono={Pencil} onClick={() => setEditar(promocion)}>
                      Editar
                    </Boton>
                    <Boton tamano="sm" variante="fantasma" className="text-rose-600 hover:bg-rose-50" icono={Trash} onClick={() => setBorrar(promocion)} aria-label="Eliminar" />
                  </>
                ) : null}
              </div>
            </Tarjeta>
          )
        })}
      </div>
      {editar !== undefined ? (
        <ModalEntidad
          key={editar?.codPromocion ?? 'nueva'}
          entidad={ENTIDAD}
          fila={editar}
          abierto
          alCerrar={() => setEditar(undefined)}
          alGuardar={(_guardada, editando) => {
            setEditar(undefined)
            setMensaje({ tipo: 'exito', texto: editando ? 'Promoción actualizada' : 'Promoción creada' })
            olvidarCatalogo('/promociones')
            cargar(true)
          }}
        />
      ) : null}
      <Modal
        abierto={Boolean(enviar)}
        alCerrar={() => setEnviar(null)}
        titulo={`Enviar ${enviar?.codigo ?? ''}`}
        pie={
          <>
            <Boton variante="secundario" onClick={() => setEnviar(null)}>
              Cancelar
            </Boton>
            <Boton icono={Send} cargando={trabajando} onClick={confirmarEnvio}>
              Enviar
            </Boton>
          </>
        }
      >
        <p className="text-sm text-slate-700">Se crea una notificación y se envía por correo a todos los clientes que aceptaron recibir avisos. Esta acción no se puede deshacer.</p>
      </Modal>
      <Modal
        abierto={Boolean(borrar)}
        alCerrar={() => setBorrar(null)}
        titulo={`¿Eliminar ${borrar?.codigo ?? ''}?`}
        pie={
          <>
            <Boton variante="secundario" onClick={() => setBorrar(null)}>
              Cancelar
            </Boton>
            <Boton variante="peligro" cargando={trabajando} onClick={confirmarBorrado}>
              Eliminar
            </Boton>
          </>
        }
      >
        <p className="text-sm text-slate-700">Si la promoción ya se usó en reservas, la base de datos no dejará eliminarla.</p>
      </Modal>
    </div>
  )
}

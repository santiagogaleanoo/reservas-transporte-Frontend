import { Bell, LayoutDashboard, LogOut, Ticket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Boton, BotonEnlace, Dato, Tarjeta } from '../components/ui'
import { useSesion } from '../sesion/contexto'
import { legible } from '../util/formato'

export default function Perfil() {
  const { usuario, esCliente, esPersonal, salir } = useSesion()
  const navegar = useNavigate()
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Tarjeta className="overflow-hidden">
        <div className="flex items-center gap-4 bg-noche-900 p-6 text-white">
          <span className="grid size-16 place-items-center rounded-full bg-marca-500 text-2xl font-bold uppercase">
            {usuario.primerNombre?.charAt(0)}
            {usuario.primerApellido?.charAt(0)}
          </span>
          <div>
            <p className="text-xl font-bold">
              {usuario.primerNombre} {usuario.primerApellido}
            </p>
            <p className="text-sm text-noche-200">{usuario.email}</p>
          </div>
        </div>
        <dl className="grid gap-5 p-6 sm:grid-cols-3">
          <Dato etiqueta="Código de usuario">{usuario.codUsuario}</Dato>
          <Dato etiqueta="Rol">{legible(usuario.rol)}</Dato>
          <Dato etiqueta="Correo">{usuario.email}</Dato>
        </dl>
        <div className="flex flex-wrap gap-2 border-t border-slate-200 p-6">
          {esCliente ? (
            <>
              <BotonEnlace to="/mis-viajes" icono={Ticket}>
                Mis viajes
              </BotonEnlace>
              <BotonEnlace to="/notificaciones" variante="secundario" icono={Bell}>
                Notificaciones
              </BotonEnlace>
            </>
          ) : null}
          {esPersonal ? (
            <BotonEnlace to="/panel" icono={LayoutDashboard}>
              Panel de gestión
            </BotonEnlace>
          ) : null}
          <Boton
            variante="fantasma"
            className="text-rose-600 hover:bg-rose-50 sm:ml-auto"
            icono={LogOut}
            onClick={() => {
              salir()
              navegar('/')
            }}
          >
            Cerrar sesión
          </Boton>
        </div>
      </Tarjeta>
    </div>
  )
}

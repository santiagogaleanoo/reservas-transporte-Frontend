import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, BusFront, ChevronDown, CircleUser, LayoutDashboard, LogOut, Menu, Plane, Store, Ticket, User, X } from 'lucide-react'
import Logo from './Logo'
import { useSesion } from '../sesion/contexto'
import { bandeja } from '../api/servicios'
import { legible } from '../util/formato'

function Enlace({ to, icono: Icono, children, alHacerClic }) {
  const ubicacion = useLocation()
  const [ruta, consulta] = to.split('?')
  const activo = ubicacion.pathname === ruta && (consulta ? ubicacion.search === `?${consulta}` : true) && (ruta !== '/' || Boolean(consulta))
  const enPanel = ruta === '/panel' && ubicacion.pathname.startsWith('/panel')
  return (
    <Link
      to={to}
      onClick={alHacerClic}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
        activo || enPanel ? 'bg-white/15 text-white' : 'text-noche-100 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icono className="size-4" />
      {children}
    </Link>
  )
}

function MenuCuenta() {
  const { usuario, esCliente, esPersonal, salir } = useSesion()
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)
  const navegar = useNavigate()

  useEffect(() => {
    if (!abierto) return undefined
    const fuera = (evento) => {
      if (caja.current && !caja.current.contains(evento.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [abierto])

  const cerrarSesion = () => {
    setAbierto(false)
    salir()
    navegar('/')
  }

  return (
    <div className="relative" ref={caja}>
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold text-white hover:bg-white/10"
        aria-expanded={abierto}
      >
        <span className="grid size-8 place-items-center rounded-full bg-marca-500 text-sm font-bold uppercase">
          {usuario.primerNombre?.charAt(0)}
          {usuario.primerApellido?.charAt(0)}
        </span>
        <span className="hidden max-w-32 truncate sm:inline">{usuario.primerNombre}</span>
        <ChevronDown className="size-4 opacity-70" />
      </button>
      {abierto ? (
        <div className="aparecer absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl bg-white text-slate-800 shadow-lg ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-bold">
              {usuario.primerNombre} {usuario.primerApellido}
            </p>
            <p className="truncate text-xs text-slate-500">{usuario.email}</p>
            <p className="mt-1 text-xs font-semibold text-marca-700">{legible(usuario.rol)}</p>
          </div>
          <nav className="py-1 text-sm" onClick={() => setAbierto(false)}>
            <Link to="/perfil" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50">
              <User className="size-4 text-slate-500" />
              Mi perfil
            </Link>
            {esCliente ? (
              <Link to="/mis-viajes" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50">
                <Ticket className="size-4 text-slate-500" />
                Mis viajes
              </Link>
            ) : null}
            {esPersonal ? (
              <Link to="/panel" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50">
                <LayoutDashboard className="size-4 text-slate-500" />
                Panel de gestión
              </Link>
            ) : null}
          </nav>
          <button type="button" onClick={cerrarSesion} className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50">
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  )
}

function Campana() {
  const { noLeidas, setNoLeidas } = useSesion()
  const ubicacion = useLocation()

  useEffect(() => {
    let vigente = true
    const contar = () =>
      bandeja
        .listar()
        .then((lista) => vigente && setNoLeidas(lista.filter((aviso) => !aviso.leida).length))
        .catch(() => null)
    contar()
    const intervalo = setInterval(contar, 60000)
    return () => {
      vigente = false
      clearInterval(intervalo)
    }
  }, [ubicacion.pathname, setNoLeidas])

  return (
    <Link to="/notificaciones" className="relative rounded-full p-2 text-noche-100 hover:bg-white/10 hover:text-white" aria-label={`Notificaciones, ${noLeidas} sin leer`}>
      <Bell className="size-5" />
      {noLeidas > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-noche-950">
          {noLeidas > 9 ? '9+' : noLeidas}
        </span>
      ) : null}
    </Link>
  )
}

export default function Encabezado() {
  const { usuario, esCliente, esPersonal, clienteTaquilla, elegirClienteTaquilla } = useSesion()
  const [menu, setMenu] = useState(false)
  const ubicacion = useLocation()
  const volver = encodeURIComponent(ubicacion.pathname + ubicacion.search)
  const cerrar = () => setMenu(false)

  const enlaces = (
    <>
      <Enlace to="/?tipo=AEREO" icono={Plane} alHacerClic={cerrar}>
        Vuelos
      </Enlace>
      <Enlace to="/?tipo=TERRESTRE" icono={BusFront} alHacerClic={cerrar}>
        Buses
      </Enlace>
      {esCliente ? (
        <Enlace to="/mis-viajes" icono={Ticket} alHacerClic={cerrar}>
          Mis viajes
        </Enlace>
      ) : null}
      {esPersonal ? (
        <Enlace to="/panel" icono={LayoutDashboard} alHacerClic={cerrar}>
          Panel
        </Enlace>
      ) : null}
    </>
  )

  return (
    <header className="sticky top-0 z-30 bg-noche-900 shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4">
        <button type="button" className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden" onClick={() => setMenu((valor) => !valor)} aria-label="Abrir menú">
          {menu ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <Logo compacto />
        <nav className="ml-4 hidden items-center gap-1 md:flex">{enlaces}</nav>
        <div className="ml-auto flex items-center gap-2">
          {usuario ? (
            <>
              {esCliente ? <Campana /> : null}
              <MenuCuenta />
            </>
          ) : (
            <>
              <Link to={`/ingresar?volver=${volver}`} className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 sm:inline-flex">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-noche-950 hover:bg-amber-300">
                <CircleUser className="hidden size-4 sm:block" />
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
      {menu ? (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 md:hidden">
          {enlaces}
          {!usuario ? (
            <Enlace to="/ingresar" icono={User} alHacerClic={cerrar}>
              Iniciar sesión
            </Enlace>
          ) : null}
        </nav>
      ) : null}
      {esPersonal && clienteTaquilla ? (
        <div className="bg-amber-400 text-noche-950">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-sm">
            <Store className="size-4" />
            <span>
              Venta en taquilla para <strong>{clienteTaquilla.nombre}</strong> ({clienteTaquilla.documento})
            </span>
            <div className="ml-auto flex gap-3 font-semibold">
              <Link to="/panel/taquilla" className="underline underline-offset-2">
                Cambiar cliente
              </Link>
              <button type="button" className="underline underline-offset-2" onClick={() => elegirClienteTaquilla(null)}>
                Terminar venta
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

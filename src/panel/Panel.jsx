import { NavLink, Outlet } from 'react-router-dom'
import { BadgePercent, ChartColumn, Database, LayoutDashboard, Route, Store, Ticket } from 'lucide-react'
import { useSesion } from '../sesion/contexto'
import { legible } from '../util/formato'

const SECCIONES = [
  { to: '/panel', texto: 'Resumen', icono: LayoutDashboard, fin: true },
  { to: '/panel/taquilla', texto: 'Taquilla y mostrador', icono: Store },
  { to: '/panel/reservas', texto: 'Reservas', icono: Ticket },
  { to: '/panel/viajes', texto: 'Operación de viajes', icono: Route },
  { to: '/panel/reportes', texto: 'Reportes', icono: ChartColumn },
  { to: '/panel/promociones', texto: 'Promociones', icono: BadgePercent },
  { to: '/panel/datos', texto: 'Datos del sistema', icono: Database },
]

export default function Panel() {
  const { usuario } = useSesion()
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside>
          <div className="mb-4 hidden rounded-2xl bg-noche-900 p-4 text-white lg:block">
            <p className="text-xs uppercase tracking-wide text-noche-200">Panel de gestión</p>
            <p className="mt-1 font-bold">
              {usuario.primerNombre} {usuario.primerApellido}
            </p>
            <p className="text-xs text-marca-200">{legible(usuario.rol)}</p>
          </div>
          <nav className="desplazable flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECCIONES.map(({ to, texto, icono: Icono, fin }) => (
              <NavLink
                key={to}
                to={to}
                end={fin}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-white text-noche-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-white/70'}`
                }
              >
                <Icono className="size-4" />
                {texto}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

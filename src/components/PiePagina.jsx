import { Link } from 'react-router-dom'
import Logo from './Logo'
import { useSesion } from '../sesion/contexto'

const ENLACES_CUENTA = {
  anonimo: [
    ['/ingresar', 'Ingresar'],
    ['/registro', 'Crear cuenta'],
  ],
  cliente: [
    ['/mis-viajes', 'Mis viajes'],
    ['/notificaciones', 'Notificaciones'],
    ['/perfil', 'Mi perfil'],
  ],
  personal: [
    ['/panel', 'Panel de gestión'],
    ['/panel/taquilla', 'Taquilla y mostrador'],
    ['/panel/reportes', 'Reportes'],
  ],
}

export default function PiePagina() {
  const { usuario, esPersonal } = useSesion()
  const enlaces = ENLACES_CUENTA[!usuario ? 'anonimo' : esPersonal ? 'personal' : 'cliente']
  return (
    <footer className="mt-16 bg-noche-950 text-noche-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-noche-300">Compara horarios y precios de aerolíneas y empresas de buses, compra en minutos y haz tu check-in en línea.</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-white">Viaja</p>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/?tipo=AEREO">Vuelos nacionales</Link></li>
            <li><Link className="hover:text-white" to="/?tipo=TERRESTRE">Buses intermunicipales</Link></li>
            <li><Link className="hover:text-white" to="/#promociones">Promociones</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-white">Tu cuenta</p>
          <ul className="space-y-2 text-sm">
            {enlaces.map(([ruta, texto]) => (
              <li key={ruta}><Link className="hover:text-white" to={ruta}>{texto}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-white">Antes de viajar</p>
          <ul className="space-y-2 text-sm text-noche-300">
            <li>El check-in abre 48 horas antes de la salida.</li>
            <li>La venta cierra 1 hora antes de cada viaje.</li>
            <li>Equipaje de mano de hasta 10 kg sin costo.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-noche-400">Proyecto final de Bases de Datos 1</div>
    </footer>
  )
}

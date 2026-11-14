import { Navigate, useLocation } from 'react-router-dom'
import { useSesion } from '../sesion/contexto'

export default function RutaProtegida({ children, roles }) {
  const { usuario, rol } = useSesion()
  const ubicacion = useLocation()
  if (!usuario) {
    return <Navigate to={`/ingresar?volver=${encodeURIComponent(ubicacion.pathname + ubicacion.search)}`} replace />
  }
  if (roles && !roles.includes(rol)) {
    return <Navigate to={rol === 'CLIENTE' ? '/mis-viajes' : '/panel'} replace />
  }
  return children
}

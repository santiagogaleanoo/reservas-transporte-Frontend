import { Navigate, Outlet } from 'react-router'
import { haySesion } from '../auth/sesion.js'

// Si no hay sesión, manda al login. Si la hay, muestra la página pedida (Outlet).
function RutaProtegida() {
  if (!haySesion()) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export default RutaProtegida

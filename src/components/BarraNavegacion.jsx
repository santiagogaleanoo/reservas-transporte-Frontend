import { NavLink, useNavigate } from 'react-router'
import { cerrarSesion, haySesion, obtenerUsuario } from '../auth/sesion.js'

function BarraNavegacion() {
  const navegar = useNavigate()

  function salir() {
    cerrarSesion()
    navegar('/login')
  }

  return (
    <header className="barra">
      <span className="marca">Reservas de Transporte</span>
      <nav>
        <NavLink to="/">Inicio</NavLink>
        <NavLink to="/paises">Países</NavLink>
      </nav>
      {haySesion() ? (
        <div className="sesion">
          <span>{obtenerUsuario()}</span>
          <button type="button" onClick={salir}>
            Salir
          </button>
        </div>
      ) : (
        <NavLink to="/login">Iniciar sesión</NavLink>
      )}
    </header>
  )
}

export default BarraNavegacion

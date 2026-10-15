import { useState } from 'react'
import { useNavigate } from 'react-router'
import { listarPaises } from '../api/paises.js'
import { cerrarSesion, guardarCredenciales } from '../auth/sesion.js'

function Login() {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const navegar = useNavigate()

  async function enviar(evento) {
    evento.preventDefault()
    setError(null)
    setCargando(true)
    guardarCredenciales(usuario, clave)
    try {
      // Con Basic Auth no hay endpoint de login: probamos las credenciales con una petición real.
      await listarPaises()
      navegar('/paises')
    } catch (e) {
      cerrarSesion()
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="tarjeta">
      <h1>Iniciar sesión</h1>
      <form onSubmit={enviar}>
        <label>
          Usuario
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={cargando}>
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </section>
  )
}

export default Login

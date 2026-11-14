import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Aviso, Boton, Campo, Casilla, Entrada } from '../components/ui'
import { useSesion } from '../sesion/contexto'
import { FOTO_INGRESO } from '../util/fotos'

export default function Login() {
  const { usuario, ingresar } = useSesion()
  const navegar = useNavigate()
  const [parametros] = useSearchParams()
  const volver = parametros.get('volver')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [recordar, setRecordar] = useState(false)
  const [verClave, setVerClave] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (usuario && !enviando) return <Navigate to={volver || '/'} replace />

  const enviar = async (evento) => {
    evento.preventDefault()
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña')
      return
    }
    setError('')
    setEnviando(true)
    try {
      const perfil = await ingresar(email, password, recordar)
      const destino = volver || (perfil.rol === 'CLIENTE' ? '/' : '/panel')
      navegar(destino, { replace: true })
    } catch (fallo) {
      setError(fallo.message)
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 lg:grid lg:grid-cols-[1.05fr_1fr]">
        <div className="relative h-40 sm:h-56 lg:h-auto lg:min-h-[580px]">
          <img src={FOTO_INGRESO.src} alt="" className="absolute inset-0 size-full object-cover" style={{ objectPosition: FOTO_INGRESO.posicion }} />
          <div className="absolute inset-0 bg-linear-to-t from-noche-950/85 via-noche-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 hidden p-8 text-white lg:block">
            <p className="text-3xl font-extrabold leading-tight tracking-tight">Tu próximo viaje empieza aquí</p>
            <p className="mt-2 max-w-sm text-white/85">Revisa tus reservas, haz check-in en línea y recibe avisos de tus viajes.</p>
          </div>
        </div>
        <div className="flex items-center p-6 sm:p-10">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-3xl font-extrabold tracking-tight text-noche-900">Inicia sesión</h1>
            <p className="mb-6 mt-1 text-sm text-slate-500">Entra con el correo y la contraseña de tu cuenta.</p>
            <form onSubmit={enviar} className="space-y-4" noValidate>
              <Campo etiqueta="Correo electrónico">
                <Entrada type="email" value={email} onChange={(evento) => setEmail(evento.target.value)} autoComplete="username" autoFocus />
              </Campo>
              <Campo etiqueta="Contraseña">
                <div className="relative">
                  <Entrada type={verClave ? 'text' : 'password'} value={password} onChange={(evento) => setPassword(evento.target.value)} autoComplete="current-password" className="pr-10" />
                  <button type="button" onClick={() => setVerClave((valor) => !valor)} className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600" aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {verClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Campo>
              <Casilla etiqueta="Mantener la sesión iniciada en este equipo" checked={recordar} onChange={(evento) => setRecordar(evento.target.checked)} />
              {error ? <Aviso tipo="error">{error}</Aviso> : null}
              <Boton type="submit" tamano="lg" className="w-full" icono={LogIn} cargando={enviando}>
                Ingresar
              </Boton>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              ¿No tienes cuenta?{' '}
              <Link to={`/registro${volver ? `?volver=${encodeURIComponent(volver)}` : ''}`} className="font-semibold text-marca-700 hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

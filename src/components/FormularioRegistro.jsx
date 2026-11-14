import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Aviso, Boton, Campo, Casilla, Entrada, Selector } from './ui'
import { auth } from '../api/servicios'
import { useCatalogo } from '../api/catalogos'
import { hoyIso } from '../util/formato'

const VACIO = {
  siglaTipoDocumento: 'CC',
  numeroDocumento: '',
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  email: '',
  password: '',
  confirmacion: '',
  telefono: '',
  fechaNacimiento: '',
  direccion: '',
  codCiudad: '',
  recibeNotificaciones: true,
}

function validar(datos) {
  const errores = {}
  if (!datos.numeroDocumento.trim()) errores.numeroDocumento = 'Escribe tu número de documento'
  if (!datos.primerNombre.trim()) errores.primerNombre = 'Escribe tu primer nombre'
  if (!datos.primerApellido.trim()) errores.primerApellido = 'Escribe tu primer apellido'
  if (!/^\S+@\S+\.\S+$/.test(datos.email.trim())) errores.email = 'Escribe un correo válido'
  if (datos.password.length < 8) errores.password = 'Usa al menos 8 caracteres'
  if (datos.password !== datos.confirmacion) errores.confirmacion = 'Las contraseñas no coinciden'
  if (datos.fechaNacimiento && datos.fechaNacimiento >= hoyIso()) errores.fechaNacimiento = 'Debe ser una fecha pasada'
  return errores
}

export default function FormularioRegistro({ alRegistrar, textoBoton = 'Crear cuenta', contrasenaSugerida }) {
  const tiposDocumento = useCatalogo('/tipos-documento')
  const ciudades = useCatalogo('/ciudades')
  const [datos, setDatos] = useState(() => (contrasenaSugerida ? { ...VACIO, password: contrasenaSugerida, confirmacion: contrasenaSugerida } : VACIO))
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [verClave, setVerClave] = useState(Boolean(contrasenaSugerida))

  const cambiar = (campo) => (evento) => setDatos({ ...datos, [campo]: evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value })

  const enviar = async (evento) => {
    evento.preventDefault()
    const encontrados = validar(datos)
    setErrores(encontrados)
    setError('')
    if (Object.keys(encontrados).length) return
    setEnviando(true)
    try {
      const cuerpo = {
        siglaTipoDocumento: datos.siglaTipoDocumento,
        numeroDocumento: datos.numeroDocumento.trim(),
        primerNombre: datos.primerNombre.trim(),
        segundoNombre: datos.segundoNombre.trim() || null,
        primerApellido: datos.primerApellido.trim(),
        segundoApellido: datos.segundoApellido.trim() || null,
        email: datos.email.trim().toLowerCase(),
        password: datos.password,
        telefono: datos.telefono.trim() || null,
        fechaNacimiento: datos.fechaNacimiento || null,
        direccion: datos.direccion.trim() || null,
        codCiudad: datos.codCiudad ? Number(datos.codCiudad) : null,
        recibeNotificaciones: datos.recibeNotificaciones,
      }
      const usuario = await auth.registro(cuerpo)
      await alRegistrar(usuario, cuerpo)
    } catch (fallo) {
      setError(fallo.message)
      if (fallo.errores) setErrores(fallo.errores)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Tipo de documento" requerido>
          <Selector value={datos.siglaTipoDocumento} onChange={cambiar('siglaTipoDocumento')}>
            {tiposDocumento.datos.map((tipo) => (
              <option key={tipo.codTipo} value={tipo.sigla}>
                {tipo.nombre}
              </option>
            ))}
          </Selector>
        </Campo>
        <Campo etiqueta="Número de documento" requerido error={errores.numeroDocumento}>
          <Entrada value={datos.numeroDocumento} onChange={cambiar('numeroDocumento')} maxLength={20} invalido={errores.numeroDocumento} />
        </Campo>
        <Campo etiqueta="Primer nombre" requerido error={errores.primerNombre}>
          <Entrada value={datos.primerNombre} onChange={cambiar('primerNombre')} maxLength={40} autoComplete="given-name" invalido={errores.primerNombre} />
        </Campo>
        <Campo etiqueta="Segundo nombre">
          <Entrada value={datos.segundoNombre} onChange={cambiar('segundoNombre')} maxLength={40} />
        </Campo>
        <Campo etiqueta="Primer apellido" requerido error={errores.primerApellido}>
          <Entrada value={datos.primerApellido} onChange={cambiar('primerApellido')} maxLength={40} autoComplete="family-name" invalido={errores.primerApellido} />
        </Campo>
        <Campo etiqueta="Segundo apellido">
          <Entrada value={datos.segundoApellido} onChange={cambiar('segundoApellido')} maxLength={40} />
        </Campo>
        <Campo etiqueta="Fecha de nacimiento" error={errores.fechaNacimiento}>
          <Entrada type="date" value={datos.fechaNacimiento} max={hoyIso()} onChange={cambiar('fechaNacimiento')} invalido={errores.fechaNacimiento} />
        </Campo>
        <Campo etiqueta="Teléfono">
          <Entrada value={datos.telefono} onChange={cambiar('telefono')} maxLength={20} inputMode="tel" autoComplete="tel" />
        </Campo>
        <Campo etiqueta="Ciudad">
          <Selector value={datos.codCiudad} onChange={cambiar('codCiudad')}>
            <option value="">Sin especificar</option>
            {[...ciudades.datos]
              .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
              .map((ciudad) => (
                <option key={ciudad.codCiudad} value={ciudad.codCiudad}>
                  {ciudad.nombre} ({ciudad.departamento?.nombre})
                </option>
              ))}
          </Selector>
        </Campo>
        <Campo etiqueta="Dirección">
          <Entrada value={datos.direccion} onChange={cambiar('direccion')} maxLength={200} autoComplete="street-address" />
        </Campo>
      </div>
      <div className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
        <Campo etiqueta="Correo electrónico" requerido error={errores.email} className="sm:col-span-2">
          <Entrada type="email" value={datos.email} onChange={cambiar('email')} maxLength={120} autoComplete="email" invalido={errores.email} />
        </Campo>
        <Campo etiqueta="Contraseña" requerido error={errores.password} ayuda="Mínimo 8 caracteres">
          <div className="relative">
            <Entrada type={verClave ? 'text' : 'password'} value={datos.password} onChange={cambiar('password')} maxLength={72} autoComplete="new-password" invalido={errores.password} className="pr-10" />
            <button type="button" onClick={() => setVerClave((valor) => !valor)} className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600" aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              {verClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Campo>
        <Campo etiqueta="Confirmar contraseña" requerido error={errores.confirmacion}>
          <Entrada type={verClave ? 'text' : 'password'} value={datos.confirmacion} onChange={cambiar('confirmacion')} maxLength={72} autoComplete="new-password" invalido={errores.confirmacion} />
        </Campo>
      </div>
      <Casilla etiqueta="Quiero recibir por correo avisos de mis viajes y promociones" checked={datos.recibeNotificaciones} onChange={cambiar('recibeNotificaciones')} />
      {error ? <Aviso tipo="error">{error}</Aviso> : null}
      <Boton type="submit" tamano="lg" className="w-full" cargando={enviando}>
        {textoBoton}
      </Boton>
    </form>
  )
}

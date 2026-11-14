const BASE = '/api'
const CLAVE_SESION = 'reservas.sesion'

let credenciales = null
let alExpirar = null

export class ErrorApi extends Error {
  constructor(estado, mensaje, errores = null) {
    super(mensaje)
    this.estado = estado
    this.errores = errores
  }
}

const TRADUCCIONES = [
  [/^must not be blank$/, 'es obligatorio'],
  [/^must not be null$/, 'es obligatorio'],
  [/^must not be empty$/, 'es obligatorio'],
  [/^must be a well-formed email address$/, 'no es un correo válido'],
  [/^must be a past date$/, 'debe ser una fecha pasada'],
  [/^must be a future date$/, 'debe ser una fecha futura'],
  [/^size must be between (\d+) and (\d+)$/, 'debe tener entre $1 y $2 caracteres'],
  [/^must be greater than or equal to (\d+)$/, 'debe ser mayor o igual a $1'],
  [/^must be less than or equal to (\d+)$/, 'debe ser menor o igual a $1'],
  [/^must match "(.*)"$/, 'no tiene el formato esperado'],
]

export function traducirValidacion(texto) {
  if (!texto) return texto
  for (const [patron, reemplazo] of TRADUCCIONES) {
    if (patron.test(texto)) return texto.replace(patron, reemplazo)
  }
  return texto
}

function leerAlmacen() {
  try {
    const texto = sessionStorage.getItem(CLAVE_SESION) ?? localStorage.getItem(CLAVE_SESION)
    return texto ? JSON.parse(texto) : null
  } catch {
    return null
  }
}

export function leerSesionGuardada() {
  const guardada = leerAlmacen()
  if (guardada?.token) credenciales = guardada.token
  return guardada
}

export function guardarSesion(token, usuario, recordar) {
  credenciales = token
  const texto = JSON.stringify({ token, usuario })
  try {
    sessionStorage.setItem(CLAVE_SESION, texto)
    if (recordar) localStorage.setItem(CLAVE_SESION, texto)
    else localStorage.removeItem(CLAVE_SESION)
  } catch {
    return
  }
}

export function borrarSesion() {
  credenciales = null
  try {
    sessionStorage.removeItem(CLAVE_SESION)
    localStorage.removeItem(CLAVE_SESION)
  } catch {
    return
  }
}

export function alCaducarSesion(funcion) {
  alExpirar = funcion
  return () => {
    if (alExpirar === funcion) alExpirar = null
  }
}

export function crearToken(email, password) {
  const bytes = new TextEncoder().encode(`${email.trim().toLowerCase()}:${password}`)
  let binario = ''
  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte)
  })
  return btoa(binario)
}

async function leerJson(respuesta) {
  const texto = await respuesta.text()
  if (!texto) return null
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}

function mensajeDeError(estado, datos) {
  if (datos?.errores && Object.keys(datos.errores).length) return 'Revisa los datos marcados en el formulario'
  const mensaje = datos?.message
  if (mensaje && mensaje !== 'No message available' && !/^(Forbidden|Not Found|Bad Request)$/.test(mensaje)) {
    return mensaje
  }
  if (estado === 403) return 'Tu rol no tiene permiso para esta operación'
  if (estado === 404) return 'No se encontró lo que buscabas'
  if (estado === 409) return 'La operación choca con datos que ya existen'
  if (estado >= 500) return 'El servidor tuvo un problema. Intenta de nuevo en un momento'
  return 'No se pudo completar la operación'
}

export async function pedir(metodo, ruta, { cuerpo, consulta, token, crudo } = {}) {
  const url = new URL(BASE + ruta, window.location.origin)
  if (consulta) {
    Object.entries(consulta).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') url.searchParams.set(clave, valor)
    })
  }
  const cabeceras = { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json, application/pdf' }
  const autorizacion = token ?? credenciales
  if (autorizacion) cabeceras.Authorization = `Basic ${autorizacion}`
  let body
  if (cuerpo !== undefined) {
    cabeceras['Content-Type'] = 'application/json'
    body = JSON.stringify(cuerpo)
  }

  let respuesta
  try {
    respuesta = await fetch(url, { method: metodo, headers: cabeceras, body })
  } catch {
    throw new ErrorApi(0, 'No hay conexión con el servidor. Revisa que el backend esté encendido')
  }

  if (respuesta.status === 401) {
    if (token) throw new ErrorApi(401, 'Correo o contraseña incorrectos, o la cuenta no está activa')
    if (credenciales) {
      borrarSesion()
      alExpirar?.()
    }
    throw new ErrorApi(401, 'Tu sesión terminó. Inicia sesión de nuevo')
  }

  if (!respuesta.ok) {
    const datos = await leerJson(respuesta)
    if (!datos && [500, 502, 503, 504].includes(respuesta.status)) {
      throw new ErrorApi(0, 'No hay conexión con el servidor. Revisa que el backend esté encendido')
    }
    const errores = datos?.errores
      ? Object.fromEntries(Object.entries(datos.errores).map(([campo, texto]) => [campo, traducirValidacion(texto)]))
      : null
    throw new ErrorApi(respuesta.status, mensajeDeError(respuesta.status, datos), errores)
  }

  if (crudo) return respuesta
  if (respuesta.status === 204) return null
  return leerJson(respuesta)
}

function nombreDeArchivo(respuesta, porDefecto) {
  const disposicion = respuesta.headers.get('Content-Disposition') ?? ''
  const utf8 = disposicion.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8) return decodeURIComponent(utf8[1])
  const simple = disposicion.match(/filename="?([^";]+)"?/i)
  return simple ? simple[1] : porDefecto
}

export async function descargar(ruta, porDefecto = 'documento.pdf') {
  const respuesta = await pedir('GET', ruta, { crudo: true })
  const contenido = await respuesta.blob()
  const enlace = document.createElement('a')
  const direccion = URL.createObjectURL(contenido)
  enlace.href = direccion
  enlace.download = nombreDeArchivo(respuesta, porDefecto)
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  setTimeout(() => URL.revokeObjectURL(direccion), 30000)
  return enlace.download
}

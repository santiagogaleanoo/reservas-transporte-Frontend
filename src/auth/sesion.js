// Guarda el usuario y la clave mientras la pestaña del navegador esté abierta.
// El backend usa Basic Auth, así que cada petición debe llevar estas credenciales.
const CLAVE = 'credenciales'

export function guardarCredenciales(usuario, clave) {
  sessionStorage.setItem(CLAVE, btoa(`${usuario}:${clave}`))
  sessionStorage.setItem('usuario', usuario)
}

export function obtenerCredenciales() {
  return sessionStorage.getItem(CLAVE)
}

export function obtenerUsuario() {
  return sessionStorage.getItem('usuario')
}

export function haySesion() {
  return obtenerCredenciales() !== null
}

export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE)
  sessionStorage.removeItem('usuario')
}

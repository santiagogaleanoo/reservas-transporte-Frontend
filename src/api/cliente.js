import { obtenerCredenciales } from '../auth/sesion.js'

// Prefijo que el proxy de Vite (vite.config.js) reenvía al backend.
const URL_BASE = '/api'

// Función común para hablar con el backend. Los demás archivos de api/ la usan.
export async function pedir(ruta, opciones = {}) {
  const credenciales = obtenerCredenciales()

  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      // Le dice a Spring Security que no abra la ventanita de login del navegador.
      'X-Requested-With': 'XMLHttpRequest',
      ...(credenciales && { Authorization: `Basic ${credenciales}` }),
      ...opciones.headers,
    },
  })

  if (respuesta.status === 401) {
    throw new Error('Usuario o clave incorrectos')
  }
  if (!respuesta.ok) {
    throw new Error(`El backend respondió ${respuesta.status}`)
  }
  // Algunas respuestas (por ejemplo un DELETE) no traen cuerpo.
  if (respuesta.status === 204) {
    return null
  }
  return respuesta.json()
}

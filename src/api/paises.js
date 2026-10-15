import { pedir } from './cliente.js'

// GET http://127.0.0.1:8080/paises  (PaisControlador)
export function listarPaises() {
  return pedir('/paises')
}

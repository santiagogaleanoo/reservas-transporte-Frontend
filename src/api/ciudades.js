import { pedir } from './cliente.js'

// GET http://127.0.0.1:8080/ciudades  (CiudadControlador)
export function listarCiudades() {
  return pedir('/ciudades')
}

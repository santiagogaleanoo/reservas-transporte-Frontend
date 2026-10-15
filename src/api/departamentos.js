import { pedir } from './cliente.js'

// GET http://127.0.0.1:8080/departamentos  (DepartamentoControlador)
export function listarDepartamentos() {
  return pedir('/departamentos')
}

// GET http://127.0.0.1:8080/departamentos/pais/{codPais}
export function listarDepartamentosPorPais(codPais) {
  return pedir(`/departamentos/pais/${codPais}`)
}

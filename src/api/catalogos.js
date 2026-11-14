import { useEffect, useState } from 'react'
import { api } from './servicios'

const memoria = new Map()

export function cargarCatalogo(ruta, { refrescar = false } = {}) {
  if (refrescar || !memoria.has(ruta)) {
    const promesa = api.get(ruta).catch((error) => {
      memoria.delete(ruta)
      throw error
    })
    memoria.set(ruta, promesa)
  }
  return memoria.get(ruta)
}

export function olvidarCatalogo(ruta) {
  memoria.delete(ruta)
}

export function useCatalogo(ruta) {
  const [estado, setEstado] = useState({ datos: [], cargando: Boolean(ruta), error: null })
  useEffect(() => {
    if (!ruta) return undefined
    let vigente = true
    cargarCatalogo(ruta)
      .then((datos) => vigente && setEstado({ datos: datos ?? [], cargando: false, error: null }))
      .catch((error) => vigente && setEstado({ datos: [], cargando: false, error }))
    return () => {
      vigente = false
    }
  }, [ruta])
  return estado
}

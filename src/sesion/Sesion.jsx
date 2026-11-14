import { useCallback, useEffect, useMemo, useState } from 'react'
import { alCaducarSesion, borrarSesion, crearToken, guardarSesion, leerSesionGuardada } from '../api/cliente'
import { auth } from '../api/servicios'
import { ContextoSesion } from './contexto'

const CLAVE_TAQUILLA = 'reservas.taquilla'

function leerTaquilla() {
  try {
    const texto = sessionStorage.getItem(CLAVE_TAQUILLA)
    return texto ? JSON.parse(texto) : null
  } catch {
    return null
  }
}

export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(() => leerSesionGuardada()?.usuario ?? null)
  const [clienteTaquilla, setClienteTaquilla] = useState(leerTaquilla)
  const [noLeidas, setNoLeidas] = useState(0)

  const elegirClienteTaquilla = useCallback((cliente) => {
    setClienteTaquilla(cliente)
    try {
      if (cliente) sessionStorage.setItem(CLAVE_TAQUILLA, JSON.stringify(cliente))
      else sessionStorage.removeItem(CLAVE_TAQUILLA)
    } catch {
      return
    }
  }, [])

  useEffect(
    () =>
      alCaducarSesion(() => {
        setUsuario(null)
        elegirClienteTaquilla(null)
      }),
    [elegirClienteTaquilla],
  )

  const ingresar = useCallback(async (email, password, recordar) => {
    const token = crearToken(email, password)
    const perfil = await auth.perfil(token)
    guardarSesion(token, perfil, recordar)
    setUsuario(perfil)
    return perfil
  }, [])

  const salir = useCallback(() => {
    borrarSesion()
    setUsuario(null)
    setNoLeidas(0)
    elegirClienteTaquilla(null)
  }, [elegirClienteTaquilla])

  const valor = useMemo(() => {
    const rol = usuario?.rol ?? null
    return {
      usuario,
      rol,
      esCliente: rol === 'CLIENTE',
      esPersonal: rol === 'ADMINISTRADOR' || rol === 'EMPLEADO',
      esAdmin: rol === 'ADMINISTRADOR',
      ingresar,
      salir,
      clienteTaquilla,
      elegirClienteTaquilla,
      noLeidas,
      setNoLeidas,
    }
  }, [usuario, ingresar, salir, clienteTaquilla, elegirClienteTaquilla, noLeidas])

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
}

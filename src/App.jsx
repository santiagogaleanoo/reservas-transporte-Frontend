import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Encabezado from './components/Encabezado'
import PiePagina from './components/PiePagina'
import RutaProtegida from './components/RutaProtegida'
import { Cargando } from './components/ui'
import CheckIn from './pages/CheckIn'
import Compra from './pages/Compra'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import MisViajes from './pages/MisViajes'
import NoEncontrada from './pages/NoEncontrada'
import Notificaciones from './pages/Notificaciones'
import Perfil from './pages/Perfil'
import Registro from './pages/Registro'
import Reserva from './pages/Reserva'
import Resultados from './pages/Resultados'

const Datos = lazy(() => import('./panel/Datos'))
const Panel = lazy(() => import('./panel/Panel'))
const Promociones = lazy(() => import('./panel/Promociones'))
const Reportes = lazy(() => import('./panel/Reportes'))
const Reservas = lazy(() => import('./panel/Reservas'))
const Resumen = lazy(() => import('./panel/Resumen'))
const Taquilla = lazy(() => import('./panel/Taquilla'))
const Viajes = lazy(() => import('./panel/Viajes'))

const PERSONAL = ['ADMINISTRADOR', 'EMPLEADO']

function AlCambiarDeRuta() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const destino = document.getElementById(hash.slice(1))
      if (destino) {
        destino.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <AlCambiarDeRuta />
      <Encabezado />
      <main className="flex-1">
        <Suspense fallback={<Cargando className="py-24" />}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/buscar" element={<Resultados />} />
          <Route path="/ingresar" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/compra/:codViaje" element={<RutaProtegida><Compra /></RutaProtegida>} />
          <Route path="/mis-viajes" element={<RutaProtegida roles={['CLIENTE']}><MisViajes /></RutaProtegida>} />
          <Route path="/reservas/:codReserva" element={<RutaProtegida><Reserva /></RutaProtegida>} />
          <Route path="/reservas/:codReserva/check-in" element={<RutaProtegida><CheckIn /></RutaProtegida>} />
          <Route path="/notificaciones" element={<RutaProtegida roles={['CLIENTE']}><Notificaciones /></RutaProtegida>} />
          <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
          <Route path="/panel" element={<RutaProtegida roles={PERSONAL}><Panel /></RutaProtegida>}>
            <Route index element={<Resumen />} />
            <Route path="taquilla" element={<Taquilla />} />
            <Route path="reservas" element={<Reservas />} />
            <Route path="viajes" element={<Viajes />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="reportes/:numero" element={<Reportes />} />
            <Route path="promociones" element={<Promociones />} />
            <Route path="datos" element={<Datos />} />
            <Route path="datos/:clave" element={<Datos />} />
          </Route>
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
        </Suspense>
      </main>
      <PiePagina />
    </div>
  )
}

import { Route, Routes } from 'react-router'
import BarraNavegacion from './components/BarraNavegacion.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/Login.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'
import Paises from './pages/Paises.jsx'

// Aquí se define qué página se muestra para cada dirección (URL).
function App() {
  return (
    <>
      <BarraNavegacion />
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          {/* Las rutas dentro de RutaProtegida piden haber iniciado sesión */}
          <Route element={<RutaProtegida />}>
            <Route path="/paises" element={<Paises />} />
          </Route>
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
    </>
  )
}

export default App

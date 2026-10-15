import { useEffect, useState } from 'react'
import { listarPaises } from '../api/paises.js'

// Página de ejemplo: trae los países del backend y los muestra en una tabla.
function Paises() {
  const [paises, setPaises] = useState([])
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)

  // useEffect con [] se ejecuta una sola vez, cuando la página aparece.
  useEffect(() => {
    listarPaises()
      .then(setPaises)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <p>Cargando países...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <section>
      <h1>Países ({paises.length})</h1>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>ISO</th>
          </tr>
        </thead>
        <tbody>
          {paises.map((pais) => (
            <tr key={pais.codPais}>
              <td>{pais.codPais}</td>
              <td>{pais.nombre}</td>
              <td>{pais.codigoIso}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default Paises

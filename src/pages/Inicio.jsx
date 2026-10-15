import { Link } from 'react-router'

function Inicio() {
  return (
    <section>
      <h1>Reservas de Transporte</h1>
      <p>Proyecto final de Bases de Datos 1. Frontend en React conectado al backend de Spring Boot.</p>
      <p>
        Inicia sesión y luego abre <Link to="/paises">Países</Link> para ver datos que vienen de PostgreSQL.
      </p>
    </section>
  )
}

export default Inicio

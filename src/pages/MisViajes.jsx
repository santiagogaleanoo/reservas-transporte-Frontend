import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import TarjetaReserva from '../components/TarjetaReserva'
import { Aviso, BotonEnlace, Cargando, Vacio } from '../components/ui'
import { compras } from '../api/servicios'
import { clasificar } from '../util/reservas'
import { FOTO_SIN_RESERVAS } from '../util/fotos'

const PESTANAS = [
  { clave: 'proximos', texto: 'Próximos' },
  { clave: 'pendientes', texto: 'Por pagar' },
  { clave: 'anteriores', texto: 'Anteriores' },
  { clave: 'canceladas', texto: 'Canceladas' },
]

export default function MisViajes() {
  const [estado, setEstado] = useState({ cargando: true, reservas: [], error: null })
  const [pestana, setPestana] = useState('proximos')

  useEffect(() => {
    compras
      .misReservas()
      .then((reservas) => setEstado({ cargando: false, reservas, error: null }))
      .catch((error) => setEstado({ cargando: false, reservas: [], error }))
  }, [])

  const grupos = useMemo(() => {
    const salida = (reserva) => reserva.tiquetes[0]?.fechaHoraSalida ?? ''
    const resultado = { proximos: [], pendientes: [], anteriores: [], canceladas: [] }
    estado.reservas.forEach((reserva) => resultado[clasificar(reserva)].push(reserva))
    resultado.proximos.sort((a, b) => salida(a).localeCompare(salida(b)))
    resultado.pendientes.sort((a, b) => salida(a).localeCompare(salida(b)))
    resultado.anteriores.sort((a, b) => salida(b).localeCompare(salida(a)))
    resultado.canceladas.sort((a, b) => b.fechaReserva.localeCompare(a.fechaReserva))
    return resultado
  }, [estado.reservas])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-noche-900">Mis viajes</h1>
          <p className="text-sm text-slate-500">Paga, cancela, haz check-in y descarga tus documentos.</p>
        </div>
        <BotonEnlace to="/" variante="secundario" icono={Search}>
          Buscar otro viaje
        </BotonEnlace>
      </div>
      <div className="desplazable mb-5 flex gap-1 overflow-x-auto border-b border-slate-200">
        {PESTANAS.map((opcion) => (
          <button
            key={opcion.clave}
            type="button"
            onClick={() => setPestana(opcion.clave)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold ${pestana === opcion.clave ? 'border-marca-600 text-marca-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {opcion.texto}
            <span className="rounded-full bg-slate-100 px-2 text-xs text-slate-600">{grupos[opcion.clave].length}</span>
          </button>
        ))}
      </div>
      {estado.cargando ? <Cargando texto="Cargando tus reservas…" /> : null}
      {estado.error ? <Aviso tipo="error">{estado.error.message}</Aviso> : null}
      {!estado.cargando && !estado.error && !grupos[pestana].length ? (
        <Vacio imagen={FOTO_SIN_RESERVAS.src} posicion={FOTO_SIN_RESERVAS.posicion} titulo="No hay reservas en esta sección" accion={<Link to="/" className="font-semibold text-marca-700 hover:underline">Buscar viajes</Link>} />
      ) : null}
      <div className="space-y-3">
        {grupos[pestana].map((reserva) => (
          <TarjetaReserva key={reserva.codReserva} reserva={reserva} />
        ))}
      </div>
    </div>
  )
}

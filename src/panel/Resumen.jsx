import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock, ChartColumn, ScanLine, Store, TriangleAlert } from 'lucide-react'
import { Barras } from '../components/Graficos'
import { Aviso, BotonEnlace, Cargando, Insignia, Tarjeta, Titulo } from '../components/ui'
import { reportes } from '../api/servicios'
import { cargarCatalogo } from '../api/catalogos'
import { useSesion } from '../sesion/contexto'
import { cifra, dinero, falta, fechaHora } from '../util/formato'

function Indicador({ titulo, valor, detalle }) {
  return (
    <Tarjeta className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-noche-900">{valor}</p>
      {detalle ? <p className="mt-1 text-sm text-slate-500">{detalle}</p> : null}
    </Tarjeta>
  )
}

export default function Resumen() {
  const { usuario } = useSesion()
  const [ingresos, setIngresos] = useState({ cargando: true, reporte: null, error: null })
  const [viajes, setViajes] = useState({ cargando: true, lista: [], error: null })

  useEffect(() => {
    reportes
      .ver(4)
      .then((reporte) => setIngresos({ cargando: false, reporte, error: null }))
      .catch((error) => setIngresos({ cargando: false, reporte: null, error }))
    cargarCatalogo('/viajes', { refrescar: true })
      .then((lista) => setViajes({ cargando: false, lista, error: null }))
      .catch((error) => setViajes({ cargando: false, lista: [], error }))
  }, [])

  const mes = new Date().toISOString().slice(0, 7)
  const filas = ingresos.reporte?.filas ?? []
  const actual = filas.find((fila) => fila.Mes === mes)
  const anterior = filas[filas.indexOf(actual) - 1]
  const variacion = actual && anterior && anterior['Ingresos ($)'] ? Math.round(((actual['Ingresos ($)'] - anterior['Ingresos ($)']) / anterior['Ingresos ($)']) * 100) : null

  const proximos = useMemo(() => {
    const ahora = Date.now()
    return viajes.lista.filter((viaje) => new Date(viaje.fechaHoraSalida).getTime() > ahora).sort((a, b) => a.fechaHoraSalida.localeCompare(b.fechaHoraSalida))
  }, [viajes.lista])
  const semana = proximos.filter((viaje) => new Date(viaje.fechaHoraSalida).getTime() < Date.now() + 7 * 86400000)
  const conNovedad = proximos.filter((viaje) => ['RETRASADO', 'CANCELADO'].includes(viaje.estado?.nombre))

  return (
    <div className="space-y-6">
      <Titulo titulo={`Hola, ${usuario.primerNombre}`} descripcion="Así va la operación hoy." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador titulo="Ingresos del mes" valor={actual ? dinero(actual['Ingresos ($)']) : '—'} detalle={variacion !== null ? `${variacion >= 0 ? '+' : ''}${variacion}% frente al mes anterior` : 'Pagos aprobados'} />
        <Indicador titulo="Pagos del mes" valor={actual ? cifra(actual.Pagos) : '—'} detalle={actual ? `Promedio ${dinero(actual['Pago promedio ($)'])}` : null} />
        <Indicador titulo="Salidas en 7 días" valor={viajes.cargando ? '…' : cifra(semana.length)} detalle={`${cifra(proximos.length)} viajes programados en total`} />
        <Indicador titulo="Viajes con novedad" valor={viajes.cargando ? '…' : cifra(conNovedad.length)} detalle="Retrasados o cancelados por salir" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <BotonEnlace to="/panel/taquilla" tamano="lg" icono={Store}>
          Vender en taquilla
        </BotonEnlace>
        <BotonEnlace to="/panel/taquilla" tamano="lg" variante="secundario" icono={ScanLine}>
          Check-in en mostrador
        </BotonEnlace>
        <BotonEnlace to="/panel/reportes" tamano="lg" variante="secundario" icono={ChartColumn}>
          Ver los 10 reportes
        </BotonEnlace>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Tarjeta className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-bold text-noche-900">Ingresos por mes</p>
            <Link to="/panel/reportes/4" className="text-sm font-semibold text-marca-700 hover:underline">
              Ver reporte
            </Link>
          </div>
          {ingresos.cargando ? <Cargando /> : null}
          {ingresos.error ? <Aviso tipo="error">{ingresos.error.message}</Aviso> : null}
          {filas.length ? <Barras filas={filas} columnaEtiqueta="Mes" columnaValor="Ingresos ($)" alto={260} /> : null}
        </Tarjeta>
        <Tarjeta>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <p className="flex items-center gap-2 font-bold text-noche-900">
              <CalendarClock className="size-4" />
              Próximas salidas
            </p>
            <Link to="/panel/viajes" className="text-sm font-semibold text-marca-700 hover:underline">
              Operación
            </Link>
          </div>
          {viajes.cargando ? <Cargando /> : null}
          {viajes.error ? <Aviso tipo="error" className="m-3">{viajes.error.message}</Aviso> : null}
          <ul className="divide-y divide-slate-100">
            {proximos.slice(0, 8).map((viaje) => (
              <li key={viaje.codViaje}>
                <Link to={`/panel/viajes?viaje=${viaje.codViaje}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {viaje.codigoViaje} · {viaje.ruta?.terminalOrigen?.ciudad?.nombre} → {viaje.ruta?.terminalDestino?.ciudad?.nombre}
                    </p>
                    <p className="text-xs text-slate-500">
                      {fechaHora(viaje.fechaHoraSalida)} · {falta(viaje.fechaHoraSalida)} · {viaje.puertaAnden ?? 'sin puerta'}
                    </p>
                  </div>
                  {viaje.estado?.nombre !== 'PROGRAMADO' ? <TriangleAlert className="size-4 text-amber-500" /> : null}
                  <Insignia estado={viaje.estado?.nombre} />
                  <ArrowRight className="size-4 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>
    </div>
  )
}

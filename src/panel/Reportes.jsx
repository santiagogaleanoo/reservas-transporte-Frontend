import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChartColumn, Code, FileDown, Sheet, Table } from 'lucide-react'
import BotonDescarga from '../components/BotonDescarga'
import GraficoReporte from '../components/Graficos'
import { Aviso, Boton, Cargando, Paginador, Tarjeta, Titulo } from '../components/ui'
import { reportes } from '../api/servicios'
import { fechaHora } from '../util/formato'
import { aCsv, formatearCelda } from '../util/tablas'

const COLORES_TIPO = {
  Simple: 'bg-sky-50 text-sky-700',
  Intermedio: 'bg-amber-50 text-amber-800',
  'Con subconsultas': 'bg-violet-50 text-violet-700',
}

function Listado() {
  const [estado, setEstado] = useState({ cargando: true, lista: [], error: null })
  useEffect(() => {
    reportes
      .listar()
      .then((lista) => setEstado({ cargando: false, lista, error: null }))
      .catch((error) => setEstado({ cargando: false, lista: [], error }))
  }, [])
  const tipos = [...new Set(estado.lista.map((reporte) => reporte.tipo))]
  return (
    <div>
      <Titulo titulo="Reportes" descripcion="Los 10 reportes del proyecto, calculados en vivo sobre la base de datos. Cada uno se puede ver aquí o descargar en PDF." />
      {estado.cargando ? <Cargando /> : null}
      {estado.error ? <Aviso tipo="error" className="mt-4">{estado.error.message}</Aviso> : null}
      {tipos.map((tipo) => (
        <section key={tipo} className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{tipo}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {estado.lista
              .filter((reporte) => reporte.tipo === tipo)
              .map((reporte) => (
                <Link key={reporte.numero} to={`/panel/reportes/${reporte.numero}`} className="group flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-marca-400">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-noche-900 text-sm font-extrabold text-white">{reporte.numero}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900">{reporte.titulo}</span>
                      <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${COLORES_TIPO[reporte.tipo] ?? 'bg-slate-100 text-slate-600'}`}>{reporte.tipo}</span>
                      {reporte.grafico ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-marca-50 px-1.5 py-0.5 text-[11px] font-bold text-marca-700">
                          <ChartColumn className="size-3" />
                          Gráfico
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">{reporte.descripcion}</span>
                  </span>
                  <ArrowRight className="mt-2 size-4 shrink-0 text-slate-300 group-hover:text-marca-600" />
                </Link>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function Detalle({ numero }) {
  const [estado, setEstado] = useState({ cargando: true, reporte: null, error: null })
  const [verSql, setVerSql] = useState(false)
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    let vigente = true
    setEstado({ cargando: true, reporte: null, error: null })
    setPagina(1)
    reportes
      .ver(numero)
      .then((reporte) => vigente && setEstado({ cargando: false, reporte, error: null }))
      .catch((error) => vigente && setEstado({ cargando: false, reporte: null, error }))
    return () => {
      vigente = false
    }
  }, [numero])

  if (estado.cargando) return <Cargando texto="Calculando el reporte…" />
  if (estado.error) return <Aviso tipo="error">{estado.error.message}</Aviso>
  const reporte = estado.reporte
  const porPagina = 20
  const filas = reporte.filas.slice((pagina - 1) * porPagina, pagina * porPagina)
  const totales = Object.fromEntries(reporte.columnasTotal.map((columna) => [columna, reporte.filas.reduce((suma, fila) => suma + Number(fila[columna] ?? 0), 0)]))

  const exportarCsv = () => {
    const contenido = new Blob([`﻿${aCsv(reporte.columnas, reporte.filas)}`], { type: 'text/csv;charset=utf-8' })
    const enlace = document.createElement('a')
    enlace.href = URL.createObjectURL(contenido)
    enlace.download = `reporte-${reporte.numero}.csv`
    enlace.click()
    setTimeout(() => URL.revokeObjectURL(enlace.href), 10000)
  }

  return (
    <div>
      <Link to="/panel/reportes" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-marca-700 hover:underline">
        <ArrowLeft className="size-4" />
        Todos los reportes
      </Link>
      <Titulo
        titulo={`${reporte.numero}. ${reporte.titulo}`}
        descripcion={`${reporte.tipo} · generado el ${fechaHora(reporte.generado)} · ${reporte.filas.length} filas`}
        acciones={
          <>
            <Boton variante="secundario" icono={Sheet} onClick={exportarCsv}>
              CSV
            </Boton>
            <BotonDescarga variante="primario" tamano="md" icono={FileDown} accion={() => reportes.pdf(reporte.numero)}>
              Descargar PDF
            </BotonDescarga>
          </>
        }
      />
      <p className="mt-3 max-w-3xl text-sm text-slate-600">{reporte.descripcion}</p>
      {reporte.grafico && reporte.filas.length ? (
        <Tarjeta className="mt-5 p-5">
          <p className="mb-4 text-sm font-bold text-noche-900">
            {reporte.columnaValor} por {reporte.columnaEtiqueta?.toLowerCase()}
          </p>
          <GraficoReporte reporte={reporte} />
        </Tarjeta>
      ) : null}
      <Tarjeta className="mt-5">
        <p className="flex items-center gap-2 border-b border-slate-200 px-5 py-3 text-sm font-bold text-noche-900">
          <Table className="size-4" />
          Resultados
        </p>
        {reporte.filas.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {reporte.columnas.map((columna) => (
                    <th key={columna} className="whitespace-nowrap px-4 py-2.5 font-semibold">
                      {columna}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filas.map((fila, posicion) => (
                  <tr key={posicion} className="hover:bg-slate-50">
                    {reporte.columnas.map((columna) => (
                      <td key={columna} className={`whitespace-nowrap px-4 py-2 ${typeof fila[columna] === 'number' ? 'text-right tabular-nums' : ''}`}>
                        {formatearCelda(columna, fila[columna])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {reporte.columnasTotal.length ? (
                <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                  <tr>
                    {reporte.columnas.map((columna, posicion) => (
                      <td key={columna} className={`whitespace-nowrap px-4 py-2 ${columna in totales ? 'text-right tabular-nums' : ''}`}>
                        {columna in totales ? formatearCelda(columna, totales[columna]) : posicion === 0 ? 'Total' : ''}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-slate-500">La consulta no devolvió filas.</p>
        )}
        <div className="px-4">
          <Paginador pagina={pagina} total={reporte.filas.length} porPagina={porPagina} alCambiar={setPagina} />
        </div>
      </Tarjeta>
      <Tarjeta className="mt-5">
        <button type="button" onClick={() => setVerSql((valor) => !valor)} className="flex w-full items-center gap-2 px-5 py-3 text-left text-sm font-bold text-noche-900">
          <Code className="size-4" />
          {verSql ? 'Ocultar la consulta SQL' : 'Ver la consulta SQL'}
        </button>
        {verSql ? <pre className="desplazable overflow-x-auto rounded-b-2xl bg-noche-950 p-5 text-xs leading-relaxed text-marca-100">{reporte.sql}</pre> : null}
      </Tarjeta>
    </div>
  )
}

export default function Reportes() {
  const { numero } = useParams()
  return numero ? <Detalle numero={numero} /> : <Listado />
}

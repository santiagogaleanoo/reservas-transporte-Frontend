import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cifra, dinero } from '../util/formato'
import { sinUnidad } from '../util/tablas'

const SERIE = '#0d8377'
const CATEGORIAS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948']
const TEXTO_SOBRE = ['#ffffff', '#ffffff', '#0b0b0b', '#0b0b0b', '#0b0b0b', '#ffffff', '#ffffff', '#ffffff']
const TINTA = '#475569'
const REJILLA = '#e2e8f0'

function compacto(valor, esDinero) {
  const numero = Number(valor)
  const absoluto = Math.abs(numero)
  const prefijo = esDinero ? '$' : ''
  if (absoluto >= 1e9) return `${prefijo}${cifra(Math.round(numero / 1e8) / 10)} mil M`
  if (absoluto >= 1e6) return `${prefijo}${cifra(Math.round(numero / 1e5) / 10)} M`
  if (absoluto >= 1e3) return `${prefijo}${cifra(Math.round(numero / 100) / 10)} mil`
  return `${prefijo}${cifra(numero)}`
}

function valorLegible(columna, valor) {
  return columna.includes('($)') ? dinero(valor) : cifra(valor)
}

function Globo({ active, payload, columnaEtiqueta, columnaValor }) {
  if (!active || !payload?.length) return null
  const fila = payload[0].payload
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-slate-200">
      <p className="font-bold text-slate-900">{fila[columnaEtiqueta]}</p>
      <p className="text-slate-600">
        {sinUnidad(columnaValor)}: <span className="font-semibold text-slate-900">{valorLegible(columnaValor, fila[columnaValor])}</span>
      </p>
    </div>
  )
}

export function Barras({ filas, columnaEtiqueta, columnaValor, alto = 300 }) {
  const esDinero = columnaValor.includes('($)')
  return (
    <ResponsiveContainer width="100%" height={alto}>
      <BarChart data={filas} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke={REJILLA} />
        <XAxis dataKey={columnaEtiqueta} tick={{ fontSize: 11, fill: TINTA }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} interval="preserveStartEnd" minTickGap={8} />
        <YAxis tickFormatter={(valor) => compacto(valor, esDinero)} tick={{ fontSize: 11, fill: TINTA }} tickLine={false} axisLine={false} width={70} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} content={<Globo columnaEtiqueta={columnaEtiqueta} columnaValor={columnaValor} />} />
        <Bar dataKey={columnaValor} fill={SERIE} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function BarrasHorizontales({ filas, columnaEtiqueta, columnaValor }) {
  const esDinero = columnaValor.includes('($)')
  const ordenadas = [...filas].sort((a, b) => Number(b[columnaValor]) - Number(a[columnaValor]))
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, ordenadas.length * 30 + 40)}>
      <BarChart data={ordenadas} layout="vertical" margin={{ top: 4, right: 48, bottom: 0, left: 8 }} barCategoryGap="22%">
        <CartesianGrid horizontal={false} stroke={REJILLA} />
        <XAxis type="number" tickFormatter={(valor) => compacto(valor, esDinero)} tick={{ fontSize: 11, fill: TINTA }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey={columnaEtiqueta} tick={{ fontSize: 11, fill: TINTA }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} width={96} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} content={<Globo columnaEtiqueta={columnaEtiqueta} columnaValor={columnaValor} />} />
        <Bar dataKey={columnaValor} fill={SERIE} radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false} label={{ position: 'right', fontSize: 11, fill: '#0f172a', formatter: (valor) => compacto(valor, esDinero) }} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function BarraSegmentada({ filas, columnaEtiqueta, columnaValor }) {
  const [activo, setActivo] = useState(null)
  const ordenadas = [...filas].sort((a, b) => Number(b[columnaValor]) - Number(a[columnaValor]))
  const principales = ordenadas.slice(0, 7)
  const resto = ordenadas.slice(7)
  const partes = resto.length ? [...principales, { [columnaEtiqueta]: 'Otros', [columnaValor]: resto.reduce((suma, fila) => suma + Number(fila[columnaValor]), 0) }] : principales
  const total = partes.reduce((suma, fila) => suma + Number(fila[columnaValor]), 0) || 1
  return (
    <div>
      <div className="relative">
        <div className="flex h-12 w-full gap-0.5 overflow-hidden rounded">
          {partes.map((fila, posicion) => {
            const porcentaje = (Number(fila[columnaValor]) / total) * 100
            return (
              <div
                key={fila[columnaEtiqueta]}
                className="relative flex items-center justify-center text-xs font-bold transition-opacity"
                style={{ width: `${porcentaje}%`, background: CATEGORIAS[posicion], color: TEXTO_SOBRE[posicion], opacity: activo === null || activo === posicion ? 1 : 0.45 }}
                onMouseEnter={() => setActivo(posicion)}
                onMouseLeave={() => setActivo(null)}
              >
                {porcentaje >= 7 ? `${cifra(Math.round(porcentaje * 10) / 10)}%` : ''}
              </div>
            )
          })}
        </div>
        {activo !== null ? (
          <div className="pointer-events-none absolute left-1/2 top-14 z-10 -translate-x-1/2 rounded-lg bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-slate-200">
            <p className="font-bold text-slate-900">{partes[activo][columnaEtiqueta]}</p>
            <p className="text-slate-600">
              {sinUnidad(columnaValor)}: <span className="font-semibold text-slate-900">{valorLegible(columnaValor, partes[activo][columnaValor])}</span> ({cifra(Math.round((Number(partes[activo][columnaValor]) / total) * 1000) / 10)}%)
            </p>
          </div>
        ) : null}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-700">
        {partes.map((fila, posicion) => (
          <li key={fila[columnaEtiqueta]} className="flex items-center gap-1.5" onMouseEnter={() => setActivo(posicion)} onMouseLeave={() => setActivo(null)}>
            <span className="size-3 rounded-sm" style={{ background: CATEGORIAS[posicion] }} />
            {fila[columnaEtiqueta]}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function GraficoReporte({ reporte }) {
  const props = { filas: reporte.filas, columnaEtiqueta: reporte.columnaEtiqueta, columnaValor: reporte.columnaValor }
  if (!reporte.grafico || !reporte.filas.length) return null
  if (reporte.grafico === 'TORTA') return <BarraSegmentada {...props} />
  if (reporte.grafico === 'BARRAS_HORIZONTALES') return <BarrasHorizontales {...props} />
  return <Barras {...props} />
}

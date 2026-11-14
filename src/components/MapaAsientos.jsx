import { useMemo } from 'react'
import { legible } from '../util/formato'

function columnasDe(asientos) {
  const letras = new Map()
  asientos.forEach((asiento) => {
    if (!letras.has(asiento.letra)) letras.set(asiento.letra, asiento.ubicacion)
  })
  const ordenadas = [...letras.keys()].sort()
  const columnas = []
  ordenadas.forEach((letra, posicion) => {
    columnas.push(letra)
    const siguiente = ordenadas[posicion + 1]
    if (siguiente && letras.get(letra) === 'PASILLO' && letras.get(siguiente) === 'PASILLO') columnas.push(null)
  })
  if (!columnas.includes(null) && columnas.length >= 4) columnas.splice(Math.floor(columnas.length / 2), 0, null)
  return columnas
}

export default function MapaAsientos({ asientos, codClase, nombreClase, ocupadosPorOtros = {}, seleccion, alElegir, permitirOcupado }) {
  const { filas, columnas } = useMemo(() => {
    const porFila = new Map()
    asientos.forEach((asiento) => {
      const fila = porFila.get(asiento.fila) ?? new Map()
      fila.set(asiento.letra, asiento)
      porFila.set(asiento.fila, fila)
    })
    return { filas: [...porFila.entries()].sort((a, b) => a[0] - b[0]), columnas: columnasDe(asientos) }
  }, [asientos])

  const enClase = (asiento) => (codClase ? asiento.codClase === Number(codClase) : nombreClase ? asiento.clase === nombreClase : true)

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5"><span className="size-4 rounded bg-white ring-1 ring-marca-500" />Libre</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-4 rounded bg-marca-600" />Tu elección</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-4 rounded bg-amber-300" />Otro viajero de la reserva</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-4 rounded bg-slate-300" />Ocupada</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-4 rounded bg-slate-100 border border-dashed border-slate-300" />Otra clase</span>
      </div>
      <div className="desplazable max-h-[480px] overflow-auto rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="mx-auto w-max">
          <div className="mb-2 flex items-center gap-1.5 pl-8">
            {columnas.map((letra, posicion) =>
              letra ? (
                <span key={letra} className="w-9 text-center text-xs font-bold text-slate-400">{letra}</span>
              ) : (
                <span key={`p${posicion}`} className="w-6" />
              ),
            )}
          </div>
          {filas.map(([numeroFila, fila]) => (
            <div key={numeroFila} className="mb-1.5 flex items-center gap-1.5">
              <span className="w-6 text-right text-xs font-semibold text-slate-400">{numeroFila}</span>
              <span className="w-0.5" />
              {columnas.map((letra, posicion) => {
                if (!letra) return <span key={`p${posicion}`} className="w-6" />
                const asiento = fila.get(letra)
                if (!asiento) return <span key={letra} className="size-9" />
                const numero = asiento.numeroAsiento
                const mio = seleccion === numero
                const deOtro = ocupadosPorOtros[numero]
                const ocupado = asiento.ocupado && !(permitirOcupado && permitirOcupado(numero))
                const otraClase = !enClase(asiento)
                const deshabilitado = (ocupado && !mio) || otraClase || Boolean(deOtro)
                let clases = 'bg-white text-slate-700 ring-1 ring-marca-400 hover:bg-marca-50'
                if (otraClase) clases = 'bg-slate-100 text-slate-300 border border-dashed border-slate-300'
                else if (mio) clases = 'bg-marca-600 text-white ring-2 ring-marca-700'
                else if (deOtro) clases = 'bg-amber-300 text-noche-950'
                else if (ocupado) clases = 'bg-slate-300 text-slate-500'
                return (
                  <button
                    key={letra}
                    type="button"
                    disabled={deshabilitado}
                    onClick={() => alElegir(mio ? null : numero)}
                    title={`${numero} · ${legible(asiento.ubicacion)} · ${legible(asiento.clase)}${ocupado ? ' · ocupada' : ''}${deOtro ? ` · ${deOtro}` : ''}`}
                    aria-label={`Silla ${numero}`}
                    aria-pressed={mio}
                    className={`grid size-9 place-items-center rounded-md text-[11px] font-bold transition disabled:cursor-not-allowed ${clases}`}
                  >
                    {deOtro ? deOtro.slice(0, 2) : ocupado && !mio ? '×' : numero}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

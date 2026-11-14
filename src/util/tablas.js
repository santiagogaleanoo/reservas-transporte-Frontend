import { cifra, dinero, fechaCorta, fechaHora, legible } from './formato'

export function formatearCelda(columna, valor) {
  if (valor === null || valor === undefined || valor === '') return '—'
  if (typeof valor === 'number') {
    if (columna.includes('($)')) return dinero(valor)
    if (columna.includes('(%)')) return `${cifra(valor)} %`
    return cifra(valor)
  }
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
  const texto = String(valor)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(texto)) return fechaHora(texto)
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return fechaCorta(texto)
  if (/^[A-Z][A-Z_]+$/.test(texto) && texto.length > 2) return legible(texto)
  return texto
}

export function sinUnidad(columna) {
  return columna.replace(/\s*\((\$|%)\)\s*$/, '')
}

export function aCsv(columnas, filas) {
  const escapar = (valor) => {
    const texto = valor === null || valor === undefined ? '' : String(valor)
    return /[",;\n]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto
  }
  return [columnas.map(escapar).join(';'), ...filas.map((fila) => columnas.map((columna) => escapar(fila[columna])).join(';'))].join('\n')
}

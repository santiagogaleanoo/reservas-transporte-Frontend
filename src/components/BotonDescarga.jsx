import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { Boton } from './ui'

export default function BotonDescarga({ accion, children, variante = 'secundario', tamano = 'sm', icono = FileDown, className = '' }) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const descargar = async () => {
    setError('')
    setCargando(true)
    try {
      await accion()
    } catch (fallo) {
      setError(fallo.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <span className={`inline-flex flex-col ${className}`}>
      <Boton variante={variante} tamano={tamano} icono={icono} cargando={cargando} onClick={descargar}>
        {children}
      </Boton>
      {error ? <span className="mt-1 max-w-64 text-xs font-medium text-rose-600">{error}</span> : null}
    </span>
  )
}

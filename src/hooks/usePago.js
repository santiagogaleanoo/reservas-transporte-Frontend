import { useMemo, useState } from 'react'
import { useCatalogo } from '../api/catalogos'

export function usePago(esPersonal) {
  const metodos = useCatalogo('/metodos-pago')
  const [codMetodo, setCodMetodo] = useState('')
  const [cuotas, setCuotas] = useState(1)
  const [referencia, setReferencia] = useState('')
  const disponibles = useMemo(() => metodos.datos.filter((metodo) => esPersonal || metodo.tipo !== 'EFECTIVO'), [metodos.datos, esPersonal])
  const metodo = disponibles.find((opcion) => opcion.codMetodo === Number(codMetodo))
  const datos = metodo
    ? { codMetodo: metodo.codMetodo, cuotas: metodo.tipo === 'TARJETA_CREDITO' ? Number(cuotas) : null, referenciaTransaccion: referencia.trim() || null }
    : null
  return { disponibles, metodo, codMetodo, setCodMetodo, cuotas, setCuotas, referencia, setReferencia, datos }
}

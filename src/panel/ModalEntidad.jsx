import { useMemo, useState } from 'react'
import { Aviso, Boton, Campo, Casilla, Entrada, Modal, Selector } from '../components/ui'
import { api } from '../api/servicios'
import { useCatalogo } from '../api/catalogos'
import { aDatetimeLocal, desdeDatetimeLocal, legible } from '../util/formato'

function valorInicial(campo, fila, inicial) {
  if (!fila) {
    if (inicial && inicial[campo.campo] !== undefined) return inicial[campo.campo]
    if (campo.porDefecto !== undefined) return campo.porDefecto
    return campo.tipo === 'booleano' ? false : ''
  }
  const valor = fila[campo.campo]
  if (campo.tipo === 'ref' || campo.tipo === 'refNumero') return valor?.[campo.idRef] ?? ''
  if (campo.tipo === 'fechaHora') return aDatetimeLocal(valor)
  if (campo.tipo === 'booleano') return Boolean(valor)
  if (campo.tipo === 'clave') return ''
  return valor ?? ''
}

function aCuerpo(campos, valores, original) {
  const cuerpo = original ? { ...original } : {}
  campos.forEach((campo) => {
    const valor = valores[campo.campo]
    if (campo.tipo === 'ref' || campo.tipo === 'refNumero') cuerpo[campo.campo] = valor === '' ? null : { [campo.idRef]: Number(valor) }
    else if (campo.tipo === 'numero' || campo.tipo === 'decimal') cuerpo[campo.campo] = valor === '' ? null : Number(valor)
    else if (campo.tipo === 'fechaHora') cuerpo[campo.campo] = desdeDatetimeLocal(valor)
    else if (campo.tipo === 'booleano') cuerpo[campo.campo] = Boolean(valor)
    else if (campo.tipo === 'clave') {
      if (valor) cuerpo[campo.campo] = valor
      else delete cuerpo[campo.campo]
    } else {
      const textoLimpio = String(valor ?? '').trim()
      cuerpo[campo.campo] = textoLimpio === '' ? null : campo.mayusculas ? textoLimpio.toUpperCase() : textoLimpio
    }
  })
  return cuerpo
}

function CampoReferencia({ campo, valor, alCambiar, deshabilitado, error }) {
  const { datos, cargando } = useCatalogo(campo.ruta)
  const opciones = useMemo(() => [...datos].map((fila) => ({ id: fila[campo.idRef], texto: campo.textoRef(fila) })).sort((a, b) => String(a.texto).localeCompare(String(b.texto), 'es')), [datos, campo])
  return (
    <Selector value={valor} onChange={(evento) => alCambiar(evento.target.value)} disabled={deshabilitado || cargando} invalido={error}>
      <option value="">{cargando ? 'Cargando…' : campo.requerido ? 'Elige una opción' : 'Ninguno'}</option>
      {opciones.map((opcion) => (
        <option key={opcion.id} value={opcion.id}>
          {opcion.texto}
        </option>
      ))}
    </Selector>
  )
}

function CampoEntidad({ campo, valor, alCambiar, editando, error }) {
  const deshabilitado = editando && campo.llave
  const requerido = campo.requerido || (campo.requeridoAlCrear && !editando)
  let control
  if (campo.tipo === 'ref') control = <CampoReferencia campo={campo} valor={valor} alCambiar={alCambiar} deshabilitado={deshabilitado} error={error} />
  else if (campo.tipo === 'enum') {
    control = (
      <Selector value={valor} onChange={(evento) => alCambiar(evento.target.value)} disabled={deshabilitado} invalido={error}>
        <option value="">{requerido ? 'Elige una opción' : 'Sin especificar'}</option>
        {campo.opciones.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion.length === 1 ? (opcion === 'F' ? 'Femenino' : 'Masculino') : legible(opcion)}
          </option>
        ))}
      </Selector>
    )
  } else if (campo.tipo === 'booleano') {
    return <Casilla etiqueta={campo.etiqueta} checked={Boolean(valor)} onChange={(evento) => alCambiar(evento.target.checked)} className="mt-6" />
  } else {
    const tipos = { numero: 'number', decimal: 'number', fecha: 'date', fechaHora: 'datetime-local', clave: 'password', refNumero: 'number' }
    control = (
      <Entrada
        type={campo.tipoEntrada ?? tipos[campo.tipo] ?? 'text'}
        step={campo.tipo === 'decimal' ? '0.01' : undefined}
        value={valor}
        maxLength={campo.max}
        disabled={deshabilitado}
        invalido={error}
        autoComplete={campo.tipo === 'clave' ? 'new-password' : 'off'}
        onChange={(evento) => alCambiar(evento.target.value)}
        className={campo.mayusculas ? 'uppercase' : ''}
      />
    )
  }
  return (
    <Campo etiqueta={campo.etiqueta} requerido={requerido} error={error} ayuda={campo.ayuda}>
      {control}
    </Campo>
  )
}

export default function ModalEntidad({ entidad, fila, abierto, alCerrar, alGuardar, despues, inicial, titulo }) {
  const editando = Boolean(fila)
  const [valores, setValores] = useState(() => Object.fromEntries(entidad.campos.map((campo) => [campo.campo, valorInicial(campo, fila, inicial)])))
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const guardar = async () => {
    const faltan = {}
    entidad.campos.forEach((campo) => {
      const requerido = campo.requerido || (campo.requeridoAlCrear && !editando)
      if (requerido && campo.tipo !== 'booleano' && (valores[campo.campo] === '' || valores[campo.campo] === null)) faltan[campo.campo] = 'Este dato es obligatorio'
    })
    setErrores(faltan)
    if (Object.keys(faltan).length) return
    setEnviando(true)
    setError('')
    try {
      const cuerpo = aCuerpo(entidad.campos, valores, fila)
      const guardado = editando ? await api.put(`${entidad.ruta}/${entidad.id(fila)}`, cuerpo) : await api.post(entidad.ruta, cuerpo)
      alGuardar(guardado, editando)
    } catch (fallo) {
      setError(fallo.message)
      if (fallo.errores) setErrores(fallo.errores)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      ancho="max-w-2xl"
      titulo={titulo ?? `${editando ? 'Editar' : 'Agregar'} · ${entidad.titulo}`}
      pie={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton cargando={enviando} onClick={guardar}>
            {editando ? 'Guardar cambios' : 'Agregar'}
          </Boton>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {entidad.campos.map((campo) => (
          <CampoEntidad key={campo.campo} campo={campo} valor={valores[campo.campo]} editando={editando} error={errores[campo.campo]} alCambiar={(valor) => setValores((actual) => ({ ...actual, [campo.campo]: valor }))} />
        ))}
      </div>
      {error ? <Aviso tipo="error" className="mt-4">{error}</Aviso> : null}
      {despues}
    </Modal>
  )
}

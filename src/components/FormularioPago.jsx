import { Campo, Entrada, Selector } from './ui'
import { dinero } from '../util/formato'

export default function FormularioPago({ pago, total, esPersonal }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Campo etiqueta="Medio de pago" requerido>
        <Selector value={pago.codMetodo} onChange={(evento) => pago.setCodMetodo(evento.target.value)}>
          <option value="">Elige una opción</option>
          {pago.disponibles.map((opcion) => (
            <option key={opcion.codMetodo} value={opcion.codMetodo}>
              {opcion.nombre}
            </option>
          ))}
        </Selector>
      </Campo>
      {pago.metodo?.tipo === 'TARJETA_CREDITO' ? (
        <Campo etiqueta="Cuotas" ayuda={pago.cuotas > 1 && total ? `${pago.cuotas} cuotas de ${dinero(Math.ceil(total / pago.cuotas))} aprox.` : 'Pago en una sola cuota'}>
          <Selector value={pago.cuotas} onChange={(evento) => pago.setCuotas(Number(evento.target.value))}>
            {Array.from({ length: 36 }, (_, posicion) => posicion + 1).map((numero) => (
              <option key={numero} value={numero}>
                {numero}
              </option>
            ))}
          </Selector>
        </Campo>
      ) : null}
      {esPersonal ? (
        <Campo etiqueta="Referencia de la transacción" ayuda="Número del datáfono o recibo. Si lo dejas vacío se genera uno." className="sm:col-span-2">
          <Entrada value={pago.referencia} onChange={(evento) => pago.setReferencia(evento.target.value)} maxLength={40} />
        </Campo>
      ) : null}
    </div>
  )
}

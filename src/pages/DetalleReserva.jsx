// src/pages/DetalleReserva.jsx
import React, { useState } from 'react';

const MOCK_TARIFAS = [
  {
    codClase: 1,
    nombre: 'EJECUTIVA',
    descripcion: 'Espacio preferencial, servicio a bordo premium y prioridad de embarque.',
    equipajeIncluidoKg: 32.0,
    permiteCambios: true,
    permiteReembolso: true,
    precio: 350.0,
  },
  {
    codClase: 2,
    nombre: 'ECONÓMICA',
    descripcion: 'Tarifa estándar con equipaje de mano e itinerario fijo.',
    equipajeIncluidoKg: 15.0,
    permiteCambios: false,
    permiteReembolso: false,
    precio: 180.0,
  },
];

const MOCK_ASIENTOS = [
  { numeroAsiento: '1A', fila: 1, ubicacion: 'VENTANA', codClase: 1 },
  { numeroAsiento: '1B', fila: 1, ubicacion: 'PASILLO', codClase: 1 },
  { numeroAsiento: '2A', fila: 2, ubicacion: 'VENTANA', codClase: 1 },
  { numeroAsiento: '2B', fila: 2, ubicacion: 'PASILLO', codClase: 1 },
  { numeroAsiento: '10A', fila: 10, ubicacion: 'VENTANA', codClase: 2 },
  { numeroAsiento: '10B', fila: 10, ubicacion: 'PASILLO', codClase: 2 },
  { numeroAsiento: '10C', fila: 10, ubicacion: 'PASILLO', codClase: 2 },
  { numeroAsiento: '10D', fila: 10, ubicacion: 'VENTANA', codClase: 2 },
];

export default function DetalleReserva({ onNavegar }) {
  const [claseSeleccionada, setClaseSeleccionada] = useState(MOCK_TARIFAS[0]);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');

  const toggleAsiento = (numeroAsiento) => {
    if (asientosSeleccionados.includes(numeroAsiento)) {
      setAsientosSeleccionados(asientosSeleccionados.filter((a) => a !== numeroAsiento));
    } else {
      setAsientosSeleccionados([...asientosSeleccionados, numeroAsiento]);
    }
  };

  const handleConfirmar = () => {
    if (asientosSeleccionados.length === 0) return;
    setMensajeExito('Reserva emitida con éxito en la plataforma corporativa.');
    setTimeout(() => {
      setMensajeExito('');
      if (onNavegar) onNavegar('inicio');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto mb-8">
        <span className="text-amber-500 font-semibold text-xs tracking-widest uppercase border border-amber-500/20 bg-amber-500/10 px-3 py-1 rounded-full">
          Configuración de Reserva
        </span>
        <h1 className="text-3xl font-light text-white mt-3 tracking-tight">
          Selección de Cabina y Ubicación
        </h1>
      </div>

      {mensajeExito && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-emerald-950/50 border border-emerald-800 rounded-lg text-emerald-200 text-sm">
          {mensajeExito}
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Izquierda: Clases y Mapa de Asientos */}
        <div className="lg:col-span-2 space-y-8">
          {/* Selector de Clase */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Clase de Servicio Disponible
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_TARIFAS.map((cs) => {
                const isSelected = claseSeleccionada.codClase === cs.codClase;
                return (
                  <div
                    key={cs.codClase}
                    onClick={() => {
                      setClaseSeleccionada(cs);
                      setAsientosSeleccionados([]);
                    }}
                    className={`cursor-pointer rounded-lg p-5 border transition-all ${
                      isSelected
                        ? 'bg-slate-950 border-amber-500 shadow-lg'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm text-white">{cs.nombre}</span>
                      <span className="text-xs font-mono font-bold text-amber-500">${cs.precio} USD</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{cs.descripcion}</p>
                    <div className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800/80 pt-3">
                      <div>Equipaje: {cs.equipajeIncluidoKg} kg incluido</div>
                      <div>Cambios: {cs.permiteCambios ? 'Permitidos' : 'No permitidos'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map de Asientos */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Asientos Disponibles ({claseSeleccionada.nombre})
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Seleccione la ubicación de sus pasajeros en el esquema del vehículo.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950 p-6 rounded-lg border border-slate-800">
              {MOCK_ASIENTOS.filter((a) => a.codClase === claseSeleccionada.codClase).map((asiento) => {
                const isSelected = asientosSeleccionados.includes(asiento.numeroAsiento);
                return (
                  <button
                    key={asiento.numeroAsiento}
                    type="button"
                    onClick={() => toggleAsiento(asiento.numeroAsiento)}
                    className={`p-4 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-amber-600 border-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <span className="text-base font-mono">{asiento.numeroAsiento}</span>
                    <span className="text-[10px] uppercase text-slate-400 mt-1">
                      {asiento.ubicacion} (Fila {asiento.fila})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Derecha: Resumen Ejecutivo */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between h-fit shadow-2xl">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6 pb-2 border-b border-slate-800">
              Resumen de Itinerario
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block uppercase">Clase Seleccionada</span>
                <span className="text-slate-200 font-semibold">{claseSeleccionada.nombre}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block uppercase">Asientos Elegidos</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {asientosSeleccionados.length === 0 ? (
                    <span className="text-xs text-slate-600 italic">Ninguno seleccionado</span>
                  ) : (
                    asientosSeleccionados.map((a) => (
                      <span key={a} className="font-mono text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
                        {a}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-500 block uppercase">Total Estiimado</span>
                <span className="text-2xl font-mono text-amber-500 font-bold">
                  ${asientosSeleccionados.length * claseSeleccionada.precio} USD
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <button
              type="button"
              disabled={asientosSeleccionados.length === 0}
              onClick={handleConfirmar}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded uppercase tracking-wider transition-colors disabled:opacity-40"
            >
              Confirmar Reserva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// src/pages/DetalleReserva.jsx
import React, { useState, useEffect } from 'react';
import { obtenerAsientosPorVehiculo, obtenerTarifasPorViaje, crearReserva } from '../api/reservasApi';

export default function DetalleReserva({ codViaje = 1, codVehiculo = 101 }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [tarifas, setTarifas] = useState([]);
  const [asientos, setAsientos] = useState([]);
  
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);

  useEffect(() => {
    const cargarDetalles = async () => {
      setLoading(true);
      try {
        const [tarifasData, asientosData] = await Promise.all([
          obtenerTarifasPorViaje(codViaje),
          obtenerAsientosPorVehiculo(codVehiculo),
        ]);
        setTarifas(tarifasData);
        setAsientos(asientosData);
        if (tarifasData.length > 0) {
          setClaseSeleccionada(tarifasData[0].claseServicio);
        }
      } catch (err) {
        // Datos de simulación en caso de desacoplamiento temporal del backend
        setTarifas([
          {
            claseServicio: {
              codClase: 1,
              nombre: 'EJECUTIVA',
              descripcion: 'Espacio preferencial, servicio a bordo premium y prioridad de embarque.',
              equipajeIncluidoKg: 32.0,
              permiteCambios: true,
              permiteReembolso: true,
            },
          },
          {
            claseServicio: {
              codClase: 2,
              nombre: 'ECONOMICA',
              descripcion: 'Tarifa estándar con equipaje de mano e itinerario fijo.',
              equipajeIncluidoKg: 15.0,
              permiteCambios: false,
              permiteReembolso: false,
            },
          },
        ]);

        setAsientos([
          { numeroAsiento: '1A', fila: 1, letra: 'A', ubicacion: 'VENTANA', claseServicio: { codClase: 1 } },
          { numeroAsiento: '1B', fila: 1, letra: 'B', ubicacion: 'PASILLO', claseServicio: { codClase: 1 } },
          { numeroAsiento: '2A', fila: 2, letra: 'A', ubicacion: 'VENTANA', claseServicio: { codClase: 1 } },
          { numeroAsiento: '2B', fila: 2, letra: 'B', ubicacion: 'PASILLO', claseServicio: { codClase: 1 } },
          { numeroAsiento: '10A', fila: 10, letra: 'A', ubicacion: 'VENTANA', claseServicio: { codClase: 2 } },
          { numeroAsiento: '10B', fila: 10, letra: 'B', ubicacion: 'PASILLO', claseServicio: { codClase: 2 } },
          { numeroAsiento: '10C', fila: 10, letra: 'C', ubicacion: 'PASILLO', claseServicio: { codClase: 2 } },
          { numeroAsiento: '10D', fila: 10, letra: 'D', ubicacion: 'VENTANA', claseServicio: { codClase: 2 } },
        ]);
        setClaseSeleccionada({
          codClase: 1,
          nombre: 'EJECUTIVA',
          descripcion: 'Espacio preferencial, servicio a bordo premium y prioridad de embarque.',
          equipajeIncluidoKg: 32.0,
          permiteCambios: true,
          permiteReembolso: true,
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDetalles();
  }, [codViaje, codVehiculo]);

  const toggleAsiento = (numeroAsiento) => {
    if (asientosSeleccionados.includes(numeroAsiento)) {
      setAsientosSeleccionados(asientosSeleccionados.filter((a) => a !== numeroAsiento));
    } else {
      setAsientosSeleccionados([...asientosSeleccionados, numeroAsiento]);
    }
  };

  const handleConfirmarReserva = async () => {
    if (asientosSeleccionados.length === 0) {
      setErrorMessage('Debe seleccionar al menos un asiento para continuar.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        codViaje,
        codClaseServicio: claseSeleccionada.codClase,
        asientos: asientosSeleccionados,
      };
      await crearReserva(payload);
      setSuccessMessage('Reserva corporativa confirmada con éxito.');
      setAsientosSeleccionados([]);
    } catch (err) {
      setErrorMessage(err.message || 'Error al emitir la reserva.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-slate-400 font-sans text-sm">
        Cargando plano de la flota y esquema tarifario...
      </div>
    );
  }

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

      {errorMessage && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-950/50 border border-red-800/80 rounded-lg text-red-200 text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-emerald-200 text-sm">
          {successMessage}
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna 1 y 2: Clases de Servicio y Mapa de Asientos */}
        <div className="lg:col-span-2 space-y-8">
          {/* Selector de Clase de Servicio */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Clase de Servicio Disponible
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tarifas.map((item) => {
                const cs = item.claseServicio;
                const isSelected = claseSeleccionada?.codClase === cs.codClase;
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
                      {isSelected && (
                        <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded uppercase">
                          Activa
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{cs.descripcion}</p>
                    <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                      <div>Equipaje: {cs.equipajeIncluidoKg} kg</div>
                      <div>Cambios: {cs.permiteCambios ? 'Permitidos' : 'No permitidos'}</div>
                      <div>Reembolso: {cs.permiteReembolso ? 'Aplica' : 'No aplica'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map de Asientos Filtrado por Clase */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Distribución de Asientos ({claseSeleccionada?.nombre || 'General'})
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Seleccione los asientos disponibles para los pasajeros en esta sesión.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950 p-6 rounded-lg border border-slate-800/60">
              {asientos
                .filter((a) => !claseSeleccionada || a.claseServicio.codClase === claseSeleccionada.codClase)
                .map((asiento) => {
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

        {/* Columna 3: Resumen Ejecutivo */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between h-fit">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6 pb-2 border-b border-slate-800">
              Resumen de Itinerario
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block uppercase">Código de Viaje</span>
                <span className="font-mono text-slate-200 font-semibold">VJ-{codViaje}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block uppercase">Clase Seleccionada</span>
                <span className="text-slate-200 font-semibold">{claseSeleccionada?.nombre || 'Sin seleccionar'}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block uppercase">Asientos Elegidos</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {asientosSeleccionados.length === 0 ? (
                    <span className="text-xs text-slate-600 italic">Ningún asiento seleccionado</span>
                  ) : (
                    asientosSeleccionados.map((a) => (
                      <span key={a} className="font-mono text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
                        {a}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <button
              type="button"
              disabled={submitting || asientosSeleccionados.length === 0}
              onClick={handleConfirmarReserva}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-sm rounded-lg uppercase tracking-wider transition-colors duration-200 disabled:opacity-40"
            >
              {submitting ? 'Emitiendo Reserva...' : 'Confirmar Reserva'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
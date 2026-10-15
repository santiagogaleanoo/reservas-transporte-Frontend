// src/pages/BusquedaViajes.jsx
import React, { useState } from 'react';

const MOCK_VIAJES = [
  {
    codViaje: 101,
    codigoViaje: 'AV-801',
    tipo: 'AÉREO',
    origen: 'Bogotá (BOG)',
    destino: 'Medellín (MDE)',
    horaSalida: '08:30 AM',
    horaLlegada: '09:45 AM',
    duracion: '1h 15m',
    operador: 'Avianca Express',
    estado: 'PROGRAMADO',
    precioBase: 240,
  },
  {
    codViaje: 102,
    codigoViaje: 'TR-302',
    tipo: 'TERRESTRE',
    origen: 'Armenia (ARM)',
    destino: 'Bogotá (BOG)',
    horaSalida: '02:00 PM',
    horaLlegada: '09:30 PM',
    duracion: '7h 30m',
    operador: 'Expreso Bolivariano',
    estado: 'PROGRAMADO',
    precioBase: 45,
  },
];

export default function BusquedaViajes({ onNavegar }) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('TODOS');

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-slate-900 font-sans pb-24">
      {/* Banner Principal Suave */}
      <div className="pt-10 pb-16 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight">
          ¿A dónde deseas viajar hoy?
        </h1>
        <p className="text-slate-500 text-xs mt-2">
          Reserva vuelos y transporte terrestre corporativo de forma rápida y segura.
        </p>
      </div>

      {/* Buscador Estilo Avianca (Card Blanco Elegante) */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl">
          {/* Selector de Píldora (Ida/Vuelta o Tipo) */}
          <div className="inline-flex bg-slate-100 p-1 rounded-full border border-slate-200 mb-6">
            {['TODOS', 'AÉREO', 'TERRESTRE'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoSeleccionado(tipo)}
                className={`text-xs font-semibold px-5 py-2 rounded-full transition-all ${
                  tipoSeleccionado === tipo
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tipo === 'TODOS' ? 'Todos los medios' : `Transporte ${tipo.toLowerCase()}`}
              </button>
            ))}
          </div>

          {/* Formulario de Campos de Búsqueda */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="border border-slate-200 rounded-2xl p-3 bg-white focus-within:border-slate-800 transition-colors">
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Origen
              </label>
              <input
                type="text"
                defaultValue="Bogotá (BOG)"
                className="w-full bg-transparent text-slate-900 text-sm font-semibold focus:outline-none"
              />
            </div>

            <div className="border border-slate-200 rounded-2xl p-3 bg-white focus-within:border-slate-800 transition-colors">
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Destino
              </label>
              <input
                type="text"
                defaultValue="Medellín (MDE)"
                className="w-full bg-transparent text-slate-900 text-sm font-semibold focus:outline-none"
              />
            </div>

            <div className="border border-slate-200 rounded-2xl p-3 bg-white focus-within:border-slate-800 transition-colors">
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Salida
              </label>
              <input
                type="date"
                defaultValue="2026-11-01"
                className="w-full bg-transparent text-slate-800 text-sm font-semibold focus:outline-none"
              />
            </div>

            {/* Botón Primario Negro Tipo Avianca */}
            <button className="h-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-98">
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Tarjeta Promocional estilo Avianca */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest bg-slate-800 text-rose-400 px-3 py-1 rounded-full font-bold">
              Tarifas Preferenciales
            </span>
            <h2 className="text-2xl font-semibold tracking-tight">
              Viajes de negocios con flexibilidad total
            </h2>
            <p className="text-xs text-slate-400 max-w-lg">
              Obtén equipaje adicional y cambios permitidos en todos los vuelos e itinerarios terrestres.
            </p>
          </div>
          <button className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-full transition-all shadow-md shrink-0">
            Conocer beneficios
          </button>
        </div>
      </div>

      {/* Resultados de Viaje */}
      <div className="max-w-6xl mx-auto px-6 mt-12 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight border-b border-slate-200 pb-2">
          Itinerarios programados ({MOCK_VIAJES.length})
        </h2>

        {MOCK_VIAJES.map((v) => (
          <div
            key={v.codViaje}
            className="bg-white border border-slate-200 rounded-2xl p-6 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                  {v.codigoViaje}
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                  {v.tipo}
                </span>
                <span className="text-xs text-slate-400">
                  {v.operador}
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{v.horaSalida}</div>
                  <div className="text-xs text-slate-500">{v.origen}</div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-mono">{v.duracion}</span>
                  <div className="w-full bg-slate-200 h-0.5 relative flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  </div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Directo</span>
                </div>

                <div>
                  <div className="text-2xl font-bold text-slate-900">{v.horaLlegada}</div>
                  <div className="text-xs text-slate-500">{v.destino}</div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto text-right border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex md:flex-col items-center md:items-end justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Desde</span>
                <span className="text-2xl font-bold text-slate-900">${v.precioBase} <span className="text-xs text-slate-400 font-normal">USD</span></span>
              </div>
              <button
                onClick={() => onNavegar('reserva')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider rounded-xl transition-all shadow-sm"
              >
                Seleccionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
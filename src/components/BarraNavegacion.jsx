// src/components/BarraNavegacion.jsx
import React from 'react';

export default function BarraNavegacion({ rutaActual, onNavegar }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Identidad de Marca */}
        <button
          onClick={() => onNavegar('inicio')}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-sm tracking-wider shadow-sm">
            GT
          </div>
          <div className="flex flex-col text-left">
            <span className="text-slate-900 font-bold text-base tracking-tight">
              GlobalTransport
            </span>
            <span className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase">
              Mobility & Travel
            </span>
          </div>
        </button>

        {/* Navegación Sobria */}
        <nav className="flex items-center gap-2 bg-slate-100 p-1 rounded-full border border-slate-200/80">
          {[
            { id: 'inicio', label: 'Búsqueda' },
            { id: 'reserva', label: 'Reservas' },
            { id: 'vehiculos', label: 'Flota' },
            { id: 'reportes', label: 'Analítica' },
          ].map((item) => {
            const isActive = rutaActual === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavegar(item.id)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Botón Acceso Estilo Avianca */}
        <button
          onClick={() => onNavegar('login')}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wider rounded-full transition-all shadow-sm"
        >
          Iniciar sesión
        </button>
      </div>
    </header>
  );
}
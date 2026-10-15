// src/pages/ResultadosBusqueda.jsx
import React from 'react';

export default function ResultadosBusqueda({ onNavegar }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto mb-8">
        <span className="text-amber-500 font-semibold text-xs tracking-widest uppercase border border-amber-500/20 bg-amber-500/10 px-3 py-1 rounded-full">
          Resultados de Búsqueda
        </span>
        <h1 className="text-3xl font-light text-white mt-3 tracking-tight">
          Itinerarios Encontrados
        </h1>
      </div>

      <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 text-center shadow-2xl">
        <p className="text-sm text-slate-400 mb-6">
          Seleccione una ruta desde el panel principal de búsqueda para ver las opciones disponibles.
        </p>
        <button
          onClick={() => onNavegar && onNavegar('inicio')}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition-colors"
        >
          Ir a Búsqueda Principal
        </button>
      </div>
    </div>
  );
}
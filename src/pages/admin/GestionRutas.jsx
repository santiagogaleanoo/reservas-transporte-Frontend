// src/pages/admin/GestionRutas.jsx
import React, { useState } from 'react';

const MOCK_RUTAS = [
  { codRuta: 1, codigo: 'RUT-BOG-MDE', distanciaKm: 240.5, duracionMin: 75, origen: 'Bogotá - El Dorado', destino: 'Medellín - J.M. Córdova' },
  { codRuta: 2, codigo: 'RUT-ARM-BOG', distanciaKm: 290.0, duracionMin: 450, origen: 'Terminal Armenia', destino: 'Terminal Salitre Bogotá' },
];

export default function GestionRutas({ onNavegar }) {
  const [rutas] = useState(MOCK_RUTAS);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <span className="text-amber-500 font-semibold text-xs tracking-widest uppercase border border-amber-500/20 bg-amber-500/10 px-3 py-1 rounded-full">
            Administración
          </span>
          <h1 className="text-3xl font-light text-white mt-3 tracking-tight">
            Gestión de Rutas Operativas
          </h1>
        </div>
        <button className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition-colors">
          + Nueva Ruta
        </button>
      </div>

      <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-xs uppercase font-semibold text-slate-400 tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Origen</th>
              <th className="px-6 py-4">Destino</th>
              <th className="px-6 py-4">Distancia (km)</th>
              <th className="px-6 py-4">Duración (min)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rutas.map((r) => (
              <tr key={r.codRuta} className="hover:bg-slate-950/40 transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-amber-500">{r.codigo}</td>
                <td className="px-6 py-4 text-white">{r.origen}</td>
                <td className="px-6 py-4 text-white">{r.destino}</td>
                <td className="px-6 py-4 font-mono">{r.distanciaKm} km</td>
                <td className="px-6 py-4 font-mono">{r.duracionMin} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
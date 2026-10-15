// src/pages/admin/DashboardReportes.jsx
import React from 'react';

export default function DashboardReportes() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto mb-10">
        <span className="text-amber-500 font-semibold text-xs tracking-widest uppercase border border-amber-500/20 bg-amber-500/10 px-3 py-1 rounded-full">
          Inteligencia de Negocios
        </span>
        <h1 className="text-3xl font-light text-white mt-3 tracking-tight">
          Panel Analítico Corporativo
        </h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <span className="text-xs uppercase font-medium text-slate-500">Reservas Totales</span>
          <div className="text-3xl font-light text-white mt-2">1,310</div>
          <span className="text-xs text-emerald-400 font-medium">+14.2% este mes</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <span className="text-xs uppercase font-medium text-slate-500">Ingresos Totales</span>
          <div className="text-3xl font-light text-amber-500 mt-2 font-mono">$193,000 USD</div>
          <span className="text-xs text-emerald-400 font-medium">+8.1% vs objetivo</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <span className="text-xs uppercase font-medium text-slate-500">Flota en Operación</span>
          <div className="text-3xl font-light text-white mt-2">48 Unidades</div>
          <span className="text-xs text-slate-400 font-medium">90% capacidad activa</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <span className="text-xs uppercase font-medium text-slate-500">Factor de Ocupación</span>
          <div className="text-3xl font-light text-white mt-2">84.5%</div>
          <span className="text-xs text-amber-400 font-medium">Promedio por viaje</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
          Distribución Operativa por Medio de Transporte
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Transporte Aéreo (65%)</span>
              <span className="font-mono text-amber-400">851 Reservas</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-amber-500 h-full w-[65%]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Transporte Terrestre (35%)</span>
              <span className="font-mono text-amber-400">459 Reservas</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-slate-400 h-full w-[35%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
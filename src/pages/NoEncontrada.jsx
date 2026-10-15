// src/pages/NoEncontrada.jsx
import React from 'react';
import { Link } from 'react-router';

export default function NoEncontrada() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-center p-6 font-sans text-slate-100">
      <h1 className="text-6xl font-light text-amber-500 mb-4">404</h1>
      <h2 className="text-xl font-light text-white mb-2">Recurso No Encontrado</h2>
      <p className="text-sm text-slate-400 mb-8 max-w-md">
        La ruta especificada no existe dentro de la plataforma corporativa.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-lg text-xs font-semibold uppercase tracking-wider text-amber-500 transition-colors"
      >
        Volver al Panel Principal
      </Link>
    </div>
  );
}
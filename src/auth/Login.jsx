// src/auth/Login.jsx
import React, { useState } from 'react';

export default function Login({ onNavegar }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', numeroDocumento: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNavegar('inicio');
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold tracking-widest text-rose-600 uppercase bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
            Plataforma Corporativa
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-4">
            Inicio de Sesión
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ingrese sus datos para gestionar sus itinerarios
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="ejecutivo@empresa.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Número de Documento
            </label>
            <input
              type="text"
              name="numeroDocumento"
              required
              value={form.numeroDocumento}
              onChange={handleChange}
              placeholder="Documento registrado"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 mt-2"
          >
            {loading ? 'Verificando...' : 'Acceder'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          ¿No tiene cuenta?{' '}
          <button onClick={() => onNavegar('registro')} className="text-rose-600 hover:underline font-bold ml-1">
            Registrarse aquí
          </button>
        </div>
      </div>
    </div>
  );
}
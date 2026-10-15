// src/auth/Registro.jsx
import React, { useState } from 'react';

export default function Registro({ onNavegar }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNavegar('login');
    }, 700);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Registro Ejecutivo
          </span>
          <h2 className="text-2xl font-light text-white tracking-tight mt-4">
            Alta de Cliente Corporativo
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Tipo Doc.
              </label>
              <select
                name="tipoDocumento"
                value={form.tipoDocumento}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="CC">CC - Cédula Ciudadanía</option>
                <option value="CE">CE - Cédula Extranjería</option>
                <option value="PAS">PAS - Pasaporte</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Número de Documento *
              </label>
              <input
                type="text"
                name="numeroDocumento"
                required
                value={form.numeroDocumento}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Nombres *
              </label>
              <input
                type="text"
                name="nombres"
                required
                value={form.nombres}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                required
                value={form.apellidos}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Procesando...' : 'Completar Registro Corporativo'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          ¿Ya dispone de credenciales?{' '}
          <button onClick={() => onNavegar('login')} className="text-amber-500 hover:underline font-semibold ml-1">
            Inicie Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
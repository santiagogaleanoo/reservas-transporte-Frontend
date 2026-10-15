import React, { useState } from 'react';
import { loginUsuario } from '../api/authApi';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginForm, setLoginForm] = useState({
    email: '',
    numeroDocumento: '',
  });

  const handleChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      await loginUsuario(loginForm);
      alert('Autenticación exitosa.');
    } catch (err) {
      setErrorMessage(err.message || 'Credenciales inválidas o error de servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 font-sans text-slate-100">
      <div className="mb-8 text-center">
        <div className="inline-block px-4 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold tracking-widest text-amber-500 uppercase mb-3">
          Sistema de Reservas Corporativas
        </div>
        <h1 className="text-3xl font-light tracking-tight text-white">
          Inicio de Sesión
        </h1>
      </div>

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md p-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-800/80 rounded-lg text-red-200 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              maxLength={120}
              value={loginForm.email}
              onChange={handleChange}
              placeholder="ejecutivo@empresa.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
              Número de Documento
            </label>
            <input
              type="text"
              name="numeroDocumento"
              required
              maxLength={20}
              value={loginForm.numeroDocumento}
              onChange={handleChange}
              placeholder="Identificación registrada"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-sm transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-sm rounded-lg transition-colors duration-200 uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Acceder a la Plataforma'}
          </button>
        </form>
      </div>
    </div>
  );
}
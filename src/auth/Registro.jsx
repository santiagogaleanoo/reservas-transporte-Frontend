import React, { useState } from 'react';
import { registrarCliente } from '../api/authApi';

export default function Registro() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [registerForm, setRegisterForm] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    direccion: '',
    codCiudad: '',
    codPais: '',
  });

  const handleChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await registrarCliente(registerForm);
      setSuccessMessage('Cuenta creada con éxito. Puede proceder a ingresar.');
    } catch (err) {
      setErrorMessage(err.message || 'No se pudo completar el registro.');
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
          Registro de Cliente
        </h1>
      </div>

      <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md p-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-800/80 rounded-lg text-red-200 text-sm">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-emerald-200 text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                Tipo Doc.
              </label>
              <select
                name="tipoDocumento"
                value={registerForm.tipoDocumento}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
              >
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="PAS">PAS</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                Número de Documento *
              </label>
              <input
                type="text"
                name="numeroDocumento"
                required
                maxLength={20}
                value={registerForm.numeroDocumento}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                Nombres *
              </label>
              <input
                type="text"
                name="nombres"
                required
                maxLength={80}
                value={registerForm.nombres}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                required
                maxLength={80}
                value={registerForm.apellidos}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                required
                maxLength={120}
                value={registerForm.email}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                maxLength={20}
                value={registerForm.telefono}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                Fecha Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={registerForm.fechaNacimiento}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                Cód. País *
              </label>
              <input
                type="number"
                name="codPais"
                required
                value={registerForm.codPais}
                onChange={handleChange}
                placeholder="ID País"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                Cód. Ciudad *
              </label>
              <input
                type="number"
                name="codCiudad"
                required
                value={registerForm.codCiudad}
                onChange={handleChange}
                placeholder="ID Ciudad"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
              Dirección Residencia
            </label>
            <input
              type="text"
              name="direccion"
              maxLength={200}
              value={registerForm.direccion}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-sm rounded-lg transition-colors duration-200 uppercase tracking-wider disabled:opacity-50 mt-4"
          >
            {loading ? 'Registrando...' : 'Completar Registro Corporativo'}
          </button>
        </form>
      </div>
    </div>
  );
}
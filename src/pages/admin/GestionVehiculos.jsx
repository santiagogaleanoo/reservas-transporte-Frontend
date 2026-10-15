// src/pages/GestionVehiculos.jsx
import React, { useState, useEffect } from 'react';
import { obtenerVehiculos, guardarVehiculo, eliminarVehiculo } from "../../api/adminApi";

export default function GestionVehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Control de Modal de Registro/Edición
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario alineado con Vehiculo.java
  const [form, setForm] = useState({
    codVehiculo: null,
    matricula: '',
    modelo: '',
    fabricante: '',
    capacidad: '',
    anioFabricacion: '',
    estado: 'ACTIVO',
    codEmpresa: '',
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await obtenerVehiculos();
      setVehiculos(data);
    } catch (err) {
      // Datos de prueba ejecutivos si la API aún no responde
      setVehiculos([
        {
          codVehiculo: 1,
          matricula: 'HK-901-AX',
          modelo: 'Boeing 737-800',
          fabricante: 'Boeing',
          capacidad: 180,
          anioFabricacion: 2021,
          estado: 'ACTIVO',
          empresa: { codEmpresa: 1, nombre: 'AeroLíneas Globales' },
        },
        {
          codVehiculo: 2,
          matricula: 'BUS-405-COL',
          modelo: 'G7 Paradiso 1200',
          fabricante: 'Marcopolo',
          capacidad: 42,
          anioFabricacion: 2022,
          estado: 'MANTENIMIENTO',
          empresa: { codEmpresa: 2, nombre: 'Expreso Terrestre SA' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpenCreateModal = () => {
    setForm({
      codVehiculo: null,
      matricula: '',
      modelo: '',
      fabricante: '',
      capacidad: '',
      anioFabricacion: '',
      estado: 'ACTIVO',
      codEmpresa: '',
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v) => {
    setForm({
      codVehiculo: v.codVehiculo,
      matricula: v.matricula,
      modelo: v.modelo,
      fabricante: v.fabricante || '',
      capacidad: v.capacidad,
      anioFabricacion: v.anioFabricacion || '',
      estado: v.estado,
      codEmpresa: v.empresa?.codEmpresa || '',
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await guardarVehiculo(form);
      setSuccessMessage(
        form.codVehiculo
          ? 'Registro de vehículo actualizado correctamente.'
          : 'Nuevo vehículo registrado en el inventario activo.'
      );
      setIsModalOpen(false);
      cargarDatos();
    } catch (err) {
      setErrorMessage(err.message || 'Error al intentar guardar el vehículo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (codVehiculo) => {
    if (!window.confirm('¿Confirma la eliminación del vehículo seleccionado del inventario corporativo?')) {
      return;
    }

    try {
      await eliminarVehiculo(codVehiculo);
      setSuccessMessage('Vehículo removido con éxito.');
      cargarDatos();
    } catch (err) {
      setErrorMessage(err.message || 'No fue posible eliminar el registro especificado.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      {/* Cabecera de Administración */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-amber-500 font-semibold text-xs tracking-widest uppercase border border-amber-500/20 bg-amber-500/10 px-3 py-1 rounded-full">
            Módulo de Administración
          </span>
          <h1 className="text-3xl font-light text-white mt-3 tracking-tight">
            Control e Inventario de Flota
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión técnica de aeronaves y unidades de transporte terrestre registradas.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs rounded-lg uppercase tracking-wider transition-colors shadow-lg self-start md:self-auto"
        >
          + Registrar Nuevo Vehículo
        </button>
      </div>

      {/* Alertas */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-950/50 border border-red-800/80 rounded-lg text-red-200 text-sm">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-emerald-200 text-sm">
          {successMessage}
        </div>
      )}

      {/* Tabla de Resultados Corporativa */}
      <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase font-semibold text-slate-400 tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Matrícula</th>
                <th className="px-6 py-4">Modelo / Fabricante</th>
                <th className="px-6 py-4">Capacidad</th>
                <th className="px-6 py-4">Año</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Empresa Operadora</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    Sincronizando inventario de vehículos...
                  </td>
                </tr>
              ) : vehiculos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No se encuentran unidades registradas en la base de datos central.
                  </td>
                </tr>
              ) : (
                vehiculos.map((v) => (
                  <tr key={v.codVehiculo} className="hover:bg-slate-950/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-amber-500">{v.matricula}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{v.modelo}</div>
                      <div className="text-xs text-slate-500">{v.fabricante || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">{v.capacidad} pasajeros</td>
                    <td className="px-6 py-4 font-mono">{v.anioFabricacion || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                          v.estado === 'ACTIVO'
                            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                            : 'bg-amber-950/60 border-amber-800 text-amber-400'
                        }`}
                      >
                        {v.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{v.empresa?.nombre || `ID Empresa: ${v.empresa?.codEmpresa}`}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(v)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-200 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(v.codVehiculo)}
                        className="px-3 py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 rounded text-xs text-red-300 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Corporativo de Creación/Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl">
            <h2 className="text-xl font-light text-white mb-6 border-b border-slate-800 pb-3">
              {form.codVehiculo ? 'Editar Vehículo' : 'Registrar Vehículo'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Matrícula *
                  </label>
                  <input
                    type="text"
                    name="matricula"
                    required
                    maxLength={15}
                    value={form.matricula}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    name="modelo"
                    required
                    maxLength={60}
                    value={form.modelo}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Fabricante
                  </label>
                  <input
                    type="text"
                    name="fabricante"
                    maxLength={60}
                    value={form.fabricante}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Capacidad *
                  </label>
                  <input
                    type="number"
                    name="capacidad"
                    required
                    min="1"
                    value={form.capacidad}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Año Fabricación
                  </label>
                  <input
                    type="number"
                    name="anioFabricacion"
                    value={form.anioFabricacion}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Estado *
                  </label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Código Empresa Operadora *
                  </label>
                  <input
                    type="number"
                    name="codEmpresa"
                    required
                    value={form.codEmpresa}
                    onChange={handleInputChange}
                    placeholder="ID Empresa"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

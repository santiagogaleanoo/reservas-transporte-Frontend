// src/pages/BusquedaViajes.jsx
import React, { useState, useEffect } from 'react';
import { buscarViajes, obtenerTiposTransporte } from '../api/viajesApi';

export default function BusquedaViajes() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [tiposTransporte, setTiposTransporte] = useState([]);
  const [resultados, setResultados] = useState(null);

  // Formulario alineado con Viaje.java, Ruta.java y TipoTransporte.java
  const [searchParams, setSearchParams] = useState({
    origenId: '',
    destinoId: '',
    fechaSalida: '',
    tipoTransporteId: '',
    pasajeros: 1,
  });

  useEffect(() => {
    // Carga de catálogo inicial
    const fetchCatalogos = async () => {
      try {
        const tipos = await obtenerTiposTransporte();
        setTiposTransporte(tipos);
      } catch (err) {
        // Mock fallback si el backend no responde aún
        setTiposTransporte([
          { codTipo: 1, nombre: 'AÉREO', descripcion: 'Vuelos comerciales corporativos' },
          { codTipo: 2, nombre: 'TERRESTRE', descripcion: 'Autobuses ejecutivos e intermunicipales' },
        ]);
      }
    };
    fetchCatalogos();
  }, []);

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    
    try {
      const data = await buscarViajes(searchParams);
      setResultados(data);
    } catch (err) {
      setErrorMessage(err.message || 'No se pudieron consultar las rutas programadas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      {/* Cabecera Corporativa */}
      <div className="max-w-6xl mx-auto mb-10">
        <span className="text-amber-500 font-semibold text-xs tracking-widest uppercase border border-amber-500/20 bg-amber-500/10 px-3 py-1 rounded-full">
          Reserva de Rutas & Itinerarios
        </span>
        <h1 className="text-3xl md:text-4xl font-light text-white mt-3 tracking-tight">
          Gestión Global de Viajes Corporativos
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-xl">
          Consulte la disponibilidad de itinerarios aéreos y terrestres, tiempos de tránsito y asignación de flota.
        </p>
      </div>

      {/* Formulario de Parámetros de Búsqueda */}
      <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-2xl mb-12">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Modalidad de Transporte */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Modalidad de Transporte
              </label>
              <select
                name="tipoTransporteId"
                value={searchParams.tipoTransporteId}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">Todas las modalidades</option>
                {tiposTransporte.map((tipo) => (
                  <option key={tipo.codTipo} value={tipo.codTipo}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Terminal Origen */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Terminal Origen (ID) *
              </label>
              <input
                type="number"
                name="origenId"
                required
                placeholder="Código de terminal salida"
                value={searchParams.origenId}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Terminal Destino */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Terminal Destino (ID) *
              </label>
              <input
                type="number"
                name="destinoId"
                required
                placeholder="Código de terminal llegada"
                value={searchParams.destinoId}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fecha de Salida */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Fecha Programada *
              </label>
              <input
                type="date"
                name="fechaSalida"
                required
                value={searchParams.fechaSalida}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Cantidad de Pasajeros */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Pasajeros
              </label>
              <input
                type="number"
                name="pasajeros"
                min="1"
                max="10"
                value={searchParams.pasajeros}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Botón de Acción */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-sm rounded-lg uppercase tracking-wider transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Consultando...' : 'Buscar Disponibilidad'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Control de Errores */}
      {errorMessage && (
        <div className="max-w-6xl mx-auto mb-8 p-4 bg-red-950/50 border border-red-800/80 rounded-lg text-red-200 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Resultados de la Búsqueda */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-light text-slate-200 mb-4 tracking-tight">
          Itinerarios Programados
        </h2>

        {!resultados && !loading && (
          <div className="border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm bg-slate-900/40">
            Ingrese los parámetros de origen, destino y fecha para generar la matriz de itinerarios.
          </div>
        )}

        {loading && (
          <div className="border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm bg-slate-900/40 animate-pulse">
            Sincronizando disponibilidad con la infraestructura central...
          </div>
        )}

        {resultados && resultados.length === 0 && (
          <div className="border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm bg-slate-900/40">
            No se encontraron viajes programados para los criterios especificados.
          </div>
        )}

        {resultados && resultados.length > 0 && (
          <div className="space-y-4">
            {resultados.map((viaje) => (
              <div
                key={viaje.codViaje}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-6 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {viaje.codigoViaje}
                    </span>
                    <span className="text-xs uppercase font-medium text-slate-400">
                      Estado: {viaje.estado}
                    </span>
                  </div>
                  <div className="text-base text-white font-medium pt-2">
                    Ruta: {viaje.ruta?.codigo || 'N/A'} ({viaje.ruta?.distanciaKm} km - {viaje.ruta?.duracionMin} min)
                  </div>
                  <div className="text-xs text-slate-400">
                    Puerta / Andén: <span className="text-slate-200">{viaje.puertaAnden || 'Sin asignar'}</span>
                  </div>
                </div>

                <div className="text-left md:text-right border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                  <div className="text-xs text-slate-400">Salida Programada</div>
                  <div className="text-sm font-semibold text-slate-100">
                    {new Date(viaje.fechaHoraSalida).toLocaleString()}
                  </div>
                  <button className="mt-3 px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-white uppercase tracking-wider transition-colors">
                    Seleccionar Asientos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
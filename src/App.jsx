// src/App.jsx
import React, { useState } from 'react';
import BarraNavegacion from './components/BarraNavegacion';
import BusquedaViajes from './pages/BusquedaViajes';
import Login from './auth/Login';
import Registro from './auth/Registro';
import DetalleReserva from './pages/DetalleReserva';
import GestionVehiculos from './pages/admin/GestionVehiculos';
import DashboardReportes from './pages/admin/DashboardReportes';

export default function App() {
  const [rutaActual, setRutaActual] = useState('inicio');

  const renderVista = () => {
    switch (rutaActual) {
      case 'login':
        return <Login onNavegar={setRutaActual} />;
      case 'registro':
        return <Registro onNavegar={setRutaActual} />;
      case 'reserva':
        return <DetalleReserva onNavegar={setRutaActual} />;
      case 'vehiculos':
        return <GestionVehiculos onNavegar={setRutaActual} />;
      case 'reportes':
        return <DashboardReportes onNavegar={setRutaActual} />;
      case 'inicio':
      default:
        return <BusquedaViajes onNavegar={setRutaActual} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      <BarraNavegacion rutaActual={rutaActual} onNavegar={setRutaActual} />
      <main>
        {renderVista()}
      </main>
    </div>
  );
}
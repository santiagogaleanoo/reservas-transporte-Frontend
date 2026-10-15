// src/api/reservasApi.js

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Consulta la matriz de asientos de un vehículo asignado a un viaje.
 * @param {number} codVehiculo
 */
export const obtenerAsientosPorVehiculo = async (codVehiculo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/asientos/vehiculo/${codVehiculo}`);
    if (!response.ok) throw new Error('Error al cargar la matriz de asientos');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Consulta las tarifas y clases de servicio configuradas para un viaje específico.
 * @param {number} codViaje
 */
export const obtenerTarifasPorViaje = async (codViaje) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tarifas/viaje/${codViaje}`);
    if (!response.ok) throw new Error('Error al consultar el esquema tarifario');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Registra la reserva asignando el cliente, asientos elegidos y clase seleccionada.
 * @param {Object} payloadReserva
 */
export const crearReserva = async (payloadReserva) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadReserva),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.mensaje || 'Error al procesar la reserva corporativa');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
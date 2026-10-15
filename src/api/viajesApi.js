// src/api/viajesApi.js

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Consulta de viajes disponibles parametrizada.
 * @param {Object} filtros - { origenId, destinoId, fechaSalida, tipoTransporteId, pasajeros }
 */
export const buscarViajes = async (filtros) => {
  try {
    const params = new URLSearchParams({
      terminalOrigenId: filtros.origenId || '',
      terminalDestinoId: filtros.destinoId || '',
      fechaSalida: filtros.fechaSalida || '',
      tipoTransporteId: filtros.tipoTransporteId || '',
      pasajeros: filtros.pasajeros || 1,
    });

    const response = await fetch(`${API_BASE_URL}/viajes/buscar?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.mensaje || 'Error al consultar disponibilidad de viajes');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene la lista de tipos de transporte registrados en el sistema.
 */
export const obtenerTiposTransporte = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tipos-transporte`);
    if (!response.ok) throw new Error('Error al cargar tipos de transporte');
    return await response.json();
  } catch (error) {
    throw error;
  }
};
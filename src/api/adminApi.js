// src/api/adminApi.js

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Consulta el listado de vehículos registrados.
 */
export const obtenerVehiculos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehiculos`);
    if (!response.ok) throw new Error('Error al listar los vehículos');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Crea o actualiza un vehículo adaptado estrictamente a Vehiculo.java.
 * @param {Object} vehiculo
 */
export const guardarVehiculo = async (vehiculo) => {
  try {
    const isEdit = Boolean(vehiculo.codVehiculo);
    const url = isEdit
      ? `${API_BASE_URL}/vehiculos/${vehiculo.codVehiculo}`
      : `${API_BASE_URL}/vehiculos`;

    const payload = {
      matricula: vehiculo.matricula,
      modelo: vehiculo.modelo,
      fabricante: vehiculo.fabricante || null,
      capacidad: Number(vehiculo.capacidad),
      anioFabricacion: vehiculo.anioFabricacion ? Number(vehiculo.anioFabricacion) : null,
      estado: vehiculo.estado,
      empresa: { codEmpresa: Number(vehiculo.codEmpresa) },
    };

    const response = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.mensaje || 'Error al procesar la operación sobre el vehículo');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina un vehículo por ID.
 * @param {number} codVehiculo
 */
export const eliminarVehiculo = async (codVehiculo) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehiculos/${codVehiculo}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar el vehículo');
    return true;
  } catch (error) {
    throw error;
  }
};
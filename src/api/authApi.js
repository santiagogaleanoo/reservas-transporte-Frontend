// src/api/authApi.js

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Petición asíncrona para inicio de sesión corporativo.
 * @param {Object} credenciales - { email, numeroDocumento }
 */
export const loginUsuario = async (credenciales) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credenciales),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.mensaje || 'Error en la autenticación');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Petición asíncrona para registro de nuevo cliente alineada exactamente a Cliente.java.
 * @param {Object} clienteData
 */
export const registrarCliente = async (clienteData) => {
  try {
    const payload = {
      tipoDocumento: clienteData.tipoDocumento,
      numeroDocumento: clienteData.numeroDocumento,
      nombres: clienteData.nombres,
      apellidos: clienteData.apellidos,
      email: clienteData.email,
      telefono: clienteData.telefono || null,
      fechaNacimiento: clienteData.fechaNacimiento || null,
      direccion: clienteData.direccion || null,
      fechaRegistro: new Date().toISOString().split('T')[0],
      ciudad: { codCiudad: Number(clienteData.codCiudad) },
      pais: { codPais: Number(clienteData.codPais) },
    };

    const response = await fetch(`${API_BASE_URL}/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.mensaje || 'Error al registrar la cuenta corporativa');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};


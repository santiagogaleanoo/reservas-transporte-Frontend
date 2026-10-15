// src/auth/sesion.js

export const cerrarSesion = () => {
  localStorage.removeItem('usuario');
  window.location.href = '/login';
};

export const haySesion = () => {
  return Boolean(localStorage.getItem('usuario'));
};

export const obtenerUsuario = () => {
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
};
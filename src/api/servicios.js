import { descargar, pedir } from './cliente'

export const api = {
  get: (ruta, consulta) => pedir('GET', ruta, { consulta }),
  post: (ruta, cuerpo) => pedir('POST', ruta, { cuerpo }),
  put: (ruta, cuerpo) => pedir('PUT', ruta, { cuerpo }),
  eliminar: (ruta) => pedir('DELETE', ruta),
}

export const auth = {
  perfil: (token) => pedir('GET', '/auth/perfil', { token }),
  registro: (datos) => pedir('POST', '/auth/registro', { cuerpo: datos }),
}

export const compras = {
  buscar: (consulta) => api.get('/compras/viajes', consulta),
  asientos: (codViaje) => api.get(`/compras/viajes/${codViaje}/asientos`),
  comprar: (datos) => api.post('/compras', datos),
  misReservas: (cliente) => api.get('/compras/mis-reservas', { cliente }),
  consultar: (codReserva) => api.get(`/compras/${codReserva}`),
  pagar: (codReserva, pago) => api.post(`/compras/${codReserva}/pagar`, pago),
  cancelar: (codReserva) => pedir('POST', `/compras/${codReserva}/cancelar`),
}

export const abordaje = {
  estado: (codReserva) => api.get(`/check-in/reservas/${codReserva}`),
  hacer: (codReserva, datos) => api.post(`/check-in/reservas/${codReserva}`, datos),
  equipaje: (codTiquete, datos) => api.post(`/check-in/tiquetes/${codTiquete}/equipajes`, datos),
  pases: (codReserva, codigo) => descargar(`/check-in/reservas/${codReserva}/pases`, `pases-${codigo}.pdf`),
  pase: (codTiquete) => descargar(`/check-in/tiquetes/${codTiquete}/pase`, `pase-${codTiquete}.pdf`),
}

export const documentos = {
  factura: (codReserva, numero) => descargar(`/facturas/${codReserva}/pdf`, `factura-${numero ?? codReserva}.pdf`),
  comprobante: (codPago) => descargar(`/pagos/${codPago}/comprobante`, `comprobante-${codPago}.pdf`),
}

export const bandeja = {
  listar: () => api.get('/notificaciones/mias'),
  leer: (codNotificacion) => pedir('POST', `/notificaciones/mias/${codNotificacion}/leida`),
  leerTodas: () => pedir('POST', '/notificaciones/mias/leidas'),
}

export const reportes = {
  listar: () => api.get('/reportes'),
  ver: (numero) => api.get(`/reportes/${numero}`),
  pdf: (numero) => descargar(`/reportes/${numero}/pdf`, `reporte-${numero}.pdf`),
}

export const avisos = {
  enviarPromocion: (codPromocion) => pedir('POST', `/notificaciones/promociones/${codPromocion}`),
}

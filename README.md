# Reservas de Transporte - Frontend

Frontend en React para el proyecto final de Bases de Datos 1. Usa todo lo que expone el backend de Spring Boot
([reservas-transporte-backend](https://github.com/cesarandres17/reservas-transporte-backend), rama `Cesar`):
búsqueda de viajes, compra con pago o reserva para pagar después, factura y comprobantes en PDF, cancelación,
check-in con cambio de silla, equipaje, pases de abordar, notificaciones, reportes y el panel de gestión.

## Versiones

| Herramienta | Versión |
|---|---|
| React | 19 |
| React Router | 7 |
| Vite | 8 |
| Tailwind CSS | 4 |
| Recharts | 3 |
| Node.js | 20.19 o más nuevo (recomendado 22 LTS) |

El backend usa Spring Boot 4.1.1 con Java 21 y PostgreSQL, y corre en `http://127.0.0.1:8080`.

## Cómo correrlo

1. Arranca el backend en el puerto 8080. Para tener datos de prueba corre antes, en este orden,
   `paises.sql`, `departamentos_col_esp.sql`, `catalogos.sql` y `datos_ejemplo.sql`.
2. En esta carpeta:

   ```bash
   npm install
   npm run dev
   ```

3. Abre http://localhost:5173

Si el backend está en otra dirección, cámbiala sin tocar el código:

```bash
BACKEND_URL=http://192.168.1.20:8080 npm run dev
```

En Windows (PowerShell): `$env:BACKEND_URL="http://192.168.1.20:8080"; npm run dev`

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@reservas.com | admin123 |
| Empleado | monica.zuluaga@reservas.com (cualquier `nombre.apellido@reservas.com` de los datos de ejemplo) | Empleado2026* |
| Cliente | cualquier cliente de los datos de ejemplo, por ejemplo ricardo.arango52@gmail.com | Viajero2026* |

También puedes crear una cuenta de cliente nueva desde "Crear cuenta".

## Qué hace cada rol

**Visitante**

- Busca vuelos y buses por ciudad de origen y destino, en una fecha o en los próximos 30 días.
- Ve los resultados con franja de fechas, filtros (transporte, horario, precio, duración, empresa, clase,
  reembolso) y orden por recomendado, más barato, más rápido o el que sale primero.
- Ve las promociones vigentes y las rutas disponibles.

**Cliente**

- Compra para varios viajeros (adultos, niños y bebés según la fecha de nacimiento), elige sillas en el
  mapa del vehículo y aplica códigos de promoción.
- Paga de una vez (tarjeta con cuotas, débito, PSE o Nequi) o reserva y paga después antes del plazo.
- Descarga la factura y los comprobantes de pago en PDF.
- Cancela reservas (con la regla de reembolso de la clase).
- Hace check-in desde 48 horas antes, cambia de silla, registra equipaje (con el cobro del exceso) y
  descarga los pases de abordar.
- Revisa sus viajes (próximos, por pagar, anteriores y cancelados) y su bandeja de notificaciones.

**Empleado y administrador** (menú "Panel")

- Resumen del día: ingresos del mes, salidas próximas y viajes con novedad.
- Taquilla: busca o registra un cliente y le vende tiquetes, incluso con pago en efectivo.
- Check-in en mostrador con el código de la reserva.
- Consulta de todas las reservas, con filtros por estado y canal.
- Operación de viajes: programar viajes, cambiar horario, puerta o vehículo, marcar retrasado o cancelado
  (el backend avisa a los pasajeros por correo) y manejar tarifas y cupos por clase.
- Los 10 reportes con gráficos, tabla, exportación a CSV, PDF y la consulta SQL de cada uno.
- Promociones: crear, editar y enviarlas por correo a los clientes.
- Datos del sistema: consulta y mantenimiento de las tablas del sistema. El administrador puede crear, editar y
  borrar todo; el empleado solo lo que el backend le permite.

## Estructura

```
index.html              Página base
vite.config.js          Vite, Tailwind y el proxy /api hacia el backend
public/favicon.svg      Ícono
src/
  main.jsx              Arranca React, el router y la sesión
  App.jsx               Rutas de la aplicación
  index.css             Tailwind y colores de la marca
  api/
    cliente.js          fetch con Basic Auth, errores y descargas de PDF
    servicios.js        Llamadas a cada grupo de endpoints (auth, compras, check-in, reportes...)
    catalogos.js        Catálogos en caché (ciudades, clases, métodos de pago...)
  sesion/               Usuario conectado, rol y cliente elegido en taquilla
  components/           Encabezado, buscador, mapa de sillas, formularios, gráficos y piezas de UI
  hooks/usePago.js      Estado del formulario de pago
  pages/                Pantallas públicas y del cliente
  panel/                Pantallas del panel de gestión
  util/                 Formatos de fecha y dinero, reglas del negocio, estilos
```

### Cómo se conecta con el backend

El front llama a `/api/...` y el proxy de Vite reenvía la petición al backend quitando el `/api`:

```
/api/compras/viajes  ->  http://127.0.0.1:8080/compras/viajes
```

Así no hace falta configurar CORS en Spring. La sesión usa HTTP Basic: al iniciar sesión se valida
el correo y la contraseña con `GET /auth/perfil` y se guardan en la pestaña (o en el navegador si
marcas "Mantener la sesión iniciada en este equipo").

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Genera la versión final en `dist/` |
| `npm run preview` | Sirve la carpeta `dist/` (también con el proxy al backend) |
| `npm run lint` | Revisa el código con oxlint |

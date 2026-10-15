# Reservas de Transporte - Frontend

Frontend en React para el proyecto final de Bases de Datos 1. Habla con el backend de Spring Boot
([reservas-transporte-backend](https://github.com/cesarandres17/reservas-transporte-backend)).

## Versiones

| Herramienta | Versión |
|---|---|
| React | 19 |
| Vite | 8 |
| React Router | 7 |
| Node.js (para correr el front) | 20.19 o más nuevo (recomendado 22 LTS) |

React corre en el navegador y se comunica con Spring Boot por HTTP y JSON, así que no depende de la
versión de Java ni de Spring Boot. El backend usa Spring Boot 4.1.1 con Java 21 y corre en
`http://127.0.0.1:8080`.

## Cómo correrlo

1. Arranca el backend (Spring Boot) en el puerto 8080.
2. En esta carpeta:

   ```bash
   npm install
   npm run dev
   ```

3. Abre http://localhost:5173 e inicia sesión con el usuario de Spring Security
   (`spring.security.user.name` y `spring.security.user.password` del `application.properties`).

## Estructura

```
index.html            Página base; React se monta en <div id="root">
vite.config.js        Configuración de Vite y del proxy /api -> backend
src/
  main.jsx            Punto de entrada: arranca React y el router
  App.jsx             Rutas: qué página se ve en cada URL
  index.css           Estilos globales
  api/                Llamadas al backend, un archivo por controlador de Spring
    cliente.js        fetch común con Basic Auth y manejo de errores
    paises.js         GET /paises
    departamentos.js  GET /departamentos y /departamentos/pais/{codPais}
    ciudades.js       GET /ciudades
  auth/
    sesion.js         Guarda usuario y clave mientras la pestaña esté abierta
  components/         Piezas reutilizables (barra de navegación, ruta protegida)
  pages/              Una pantalla completa por archivo (Inicio, Login, Paises...)
```

### Cómo se conecta con el backend

El front nunca llama directo a `http://127.0.0.1:8080`. Llama a `/api/...` y el proxy de Vite
reenvía la petición quitando el `/api`:

```
/api/paises  ->  http://127.0.0.1:8080/paises
```

Así el navegador cree que todo viene del mismo servidor y no hace falta configurar CORS en Spring.

### Agregar una pantalla nueva

1. Crea la función en `src/api/` (por ejemplo `listarRutas()` que llama a `pedir('/rutas')`).
2. Crea la página en `src/pages/` usando `useEffect` y `useState`, igual que `Paises.jsx`.
3. Regístrala en `src/App.jsx` con un `<Route>` (dentro de `RutaProtegida` si necesita sesión).
4. Agrega el enlace en `src/components/BarraNavegacion.jsx`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Genera la versión final en `dist/` |
| `npm run preview` | Sirve la carpeta `dist/` para probarla |
| `npm run lint` | Revisa el código con oxlint |

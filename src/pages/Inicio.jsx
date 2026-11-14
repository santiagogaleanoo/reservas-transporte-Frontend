import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, BellRing, BusFront, Copy, CreditCard, MapPin, Plane, ScanLine, Search } from 'lucide-react'
import Buscador from '../components/Buscador'
import { BotonEnlace } from '../components/ui'
import { useCatalogo } from '../api/catalogos'
import { useSesion } from '../sesion/contexto'
import { cifra, duracion, fechaCorta, hoyIso, sinTildes } from '../util/formato'
import { aConsulta } from '../util/busqueda'
import { DESTINOS, FONDOS_PROMOCION, MARAVILLAS, MOSAICO_VIAJEROS, PORTADAS } from '../util/fotos'

const PASOS = [
  { icono: Search, titulo: 'Busca y compara', texto: 'Mira en una sola lista los vuelos y buses de todas las empresas, con filtros por horario, clase y precio.' },
  { icono: CreditCard, titulo: 'Paga como prefieras', texto: 'Tarjeta de crédito a cuotas, débito, PSE o Nequi. También puedes reservar y pagar después.' },
  { icono: ScanLine, titulo: 'Check-in en línea', texto: 'Desde 48 horas antes de salir eliges tu silla, registras el equipaje y descargas el pase de abordar.' },
  { icono: BellRing, titulo: 'Avisos por correo', texto: 'Te contamos si tu viaje cambia de hora o de puerta y te recordamos cuándo salir.' },
]

function TituloSeccion({ antetitulo, titulo, texto, className = 'mb-6' }) {
  return (
    <div className={className}>
      {antetitulo ? <p className="text-sm font-semibold uppercase tracking-wider text-marca-600">{antetitulo}</p> : null}
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-noche-900 sm:text-3xl">{titulo}</h2>
      {texto ? <p className="mt-1.5 text-slate-500">{texto}</p> : null}
    </div>
  )
}

function Portada({ titulo, children }) {
  const [actual, setActual] = useState(0)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const espera = setTimeout(() => setActual((indice) => (indice + 1) % PORTADAS.length), 7000)
    return () => clearTimeout(espera)
  }, [actual])

  return (
    <section className="relative bg-noche-950">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {PORTADAS.map((foto, indice) => (
          <img
            key={foto.src}
            src={foto.src}
            alt=""
            fetchPriority={indice === 0 ? 'high' : 'low'}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${indice === actual ? 'acercar opacity-100' : 'opacity-0'}`}
            style={{ objectPosition: foto.posicion }}
          />
        ))}
        <div className="absolute inset-0 bg-linear-to-b from-noche-950/60 via-noche-950/20 to-noche-950/75" />
        <div className="absolute inset-0 bg-linear-to-r from-noche-950/50 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-14 sm:pt-20">
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-sm sm:text-6xl">{titulo}</h1>
        <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">Compara horarios y precios de aerolíneas y empresas de buses, y reserva en minutos.</p>
        <div className="mt-8">{children}</div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 sm:mt-16">
          <p className="flex items-center gap-1.5 text-xs font-medium text-white/80">
            <MapPin className="size-3.5" />
            {PORTADAS[actual].lugar}
          </p>
          <div className="flex gap-2">
            {PORTADAS.map((foto, indice) => (
              <button
                key={foto.src}
                type="button"
                onClick={() => setActual(indice)}
                aria-label={`Ver foto ${indice + 1}: ${foto.lugar}`}
                aria-current={indice === actual}
                className={`h-1.5 rounded-full transition-all ${indice === actual ? 'w-8 bg-white' : 'w-4 bg-white/45 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Promociones() {
  const { datos } = useCatalogo('/promociones')
  const [copiado, setCopiado] = useState('')
  const hoy = hoyIso()
  const vigentes = datos.filter((promocion) => promocion.fechaFin >= hoy).sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
  if (!vigentes.length) return null

  const copiar = (codigo) => {
    navigator.clipboard?.writeText(codigo).catch(() => null)
    setCopiado(codigo)
    setTimeout(() => setCopiado(''), 1800)
  }

  return (
    <section id="promociones" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-14">
      <TituloSeccion antetitulo="Ofertas" titulo="Promociones" texto="Escribe el código al momento de pagar." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vigentes.map((promocion, indice) => {
          const activa = promocion.fechaInicio <= hoy
          return (
            <article key={promocion.codPromocion} className="group relative isolate flex min-h-56 flex-col justify-between overflow-hidden rounded-2xl bg-noche-900 p-5 text-white shadow-sm">
              <img src={FONDOS_PROMOCION[indice % FONDOS_PROMOCION.length]} alt="" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 -z-10 bg-linear-to-br from-noche-950/95 via-noche-950/75 to-noche-900/30" />
              <div>
                <p className="text-5xl font-extrabold tracking-tight text-amber-300">-{cifra(promocion.porcentajeDescuento)}%</p>
                <p className="mt-2 max-w-xs text-sm text-white/90">{promocion.descripcion}</p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-2">
                <button type="button" onClick={() => copiar(promocion.codigo)} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-amber-300/80 bg-noche-950/40 px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-amber-200 backdrop-blur-sm hover:bg-noche-950/60">
                  {promocion.codigo}
                  <Copy className="size-3.5" />
                </button>
                <span className="text-right text-xs font-medium text-white/80">
                  {copiado === promocion.codigo ? '¡Código copiado!' : activa ? `Hasta el ${fechaCorta(promocion.fechaFin)}` : `Desde el ${fechaCorta(promocion.fechaInicio)}`}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function DestinosPopulares() {
  const { datos: ciudades } = useCatalogo('/ciudades')
  const codigoDe = (nombre) => ciudades.find((ciudad) => sinTildes(ciudad.nombre) === sinTildes(nombre))?.codCiudad

  return (
    <section className="mx-auto max-w-7xl px-4 pt-14">
      <TituloSeccion antetitulo="Destinos populares" titulo="¿Para dónde vas?" texto="Elige un destino y te lo dejamos listo en el buscador." />
      <div className="grid gap-4 md:grid-cols-3">
        {DESTINOS.map((destino) => {
          const codigo = codigoDe(destino.ciudad)
          const contenido = (
            <>
              <img src={destino.src} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" style={{ objectPosition: destino.posicion }} />
              <div className="absolute inset-0 bg-linear-to-t from-noche-950/95 via-noche-950/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">{destino.region}</p>
                <h3 className="mt-1 text-2xl font-extrabold tracking-tight">{destino.titulo}</h3>
                <p className="mt-1 text-sm text-white/85">{destino.texto}</p>
                {codigo ? (
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-noche-900 transition-colors group-hover:bg-amber-300">
                    Buscar viajes
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                ) : null}
              </div>
            </>
          )
          const clases = 'group relative block h-96 overflow-hidden rounded-2xl bg-noche-900 shadow-sm md:h-[440px]'
          return codigo ? (
            <Link key={destino.titulo} to={`/?destino=${codigo}`} className={clases}>
              {contenido}
            </Link>
          ) : (
            <div key={destino.titulo} className={clases}>
              {contenido}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function RutasPopulares() {
  const { datos } = useCatalogo('/rutas')
  if (!datos.length) return null
  const rutas = [...datos].sort((a, b) => a.terminalOrigen.ciudad.nombre.localeCompare(b.terminalOrigen.ciudad.nombre, 'es')).slice(0, 12)
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14">
      <TituloSeccion antetitulo="Rutas" titulo="Rutas que puedes reservar" texto="Toca una ruta para ver los viajes de los próximos 30 días." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rutas.map((ruta) => {
          const aereo = ruta.terminalOrigen.tipoTransporte?.nombre === 'AEREO'
          const Icono = aereo ? Plane : BusFront
          const consulta = aConsulta({
            origen: ruta.terminalOrigen.ciudad.codCiudad,
            destino: ruta.terminalDestino.ciudad.codCiudad,
            pasajeros: 1,
            tipo: aereo ? 'AEREO' : 'TERRESTRE',
            flexible: true,
          })
          return (
            <Link key={ruta.codRuta} to={`/buscar?${consulta}`} className="group flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${aereo ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700'}`}>
                <Icono className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-900">
                  {ruta.terminalOrigen.ciudad.nombre} → {ruta.terminalDestino.ciudad.nombre}
                </span>
                <span className="block text-xs text-slate-500">
                  {ruta.terminalOrigen.codigo} – {ruta.terminalDestino.codigo} · {duracion(ruta.duracionMin)}
                </span>
              </span>
              <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-marca-600" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function Maravillas() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14">
      <TituloSeccion antetitulo="Inspírate" titulo="Colombia para descubrir" texto="Paisajes que vale la pena ver al menos una vez en la vida." />
      <div className="grid gap-4 md:grid-cols-2 lg:h-[520px] lg:grid-cols-4 lg:grid-rows-2">
        {MARAVILLAS.map((lugar, indice) => (
          <figure key={lugar.titulo} className={`group relative h-64 overflow-hidden rounded-2xl bg-noche-900 lg:h-auto ${indice === 0 ? 'lg:col-span-2 lg:row-span-2' : indice === 1 ? 'lg:row-span-2' : ''}`}>
            <img src={lugar.src} alt={lugar.titulo} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" style={{ objectPosition: lugar.posicion }} />
            <div className="absolute inset-0 bg-linear-to-t from-noche-950/85 via-noche-950/10 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
              <p className="flex items-center gap-1 text-xs font-semibold text-white/80">
                <MapPin className="size-3.5" />
                {lugar.region}
              </p>
              <p className={`mt-1 font-extrabold tracking-tight ${indice === 0 ? 'text-3xl' : 'text-xl'}`}>{lugar.titulo}</p>
              <p className={`mt-1 max-w-md text-sm text-white/85 ${indice < 2 ? '' : 'lg:hidden'}`}>{lugar.texto}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function AsiDeFacil() {
  const { usuario } = useSesion()
  const [principal, ...secundarias] = MOSAICO_VIAJEROS
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14">
      <div className="grid items-center gap-10 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8 lg:grid-cols-2 lg:p-10">
        <div className="grid grid-cols-2 gap-3">
          <img src={principal.src} alt={principal.alt} loading="lazy" className="col-span-2 h-56 w-full rounded-2xl object-cover sm:h-72" style={{ objectPosition: principal.posicion }} />
          {secundarias.map((foto) => (
            <img key={foto.src} src={foto.src} alt={foto.alt} loading="lazy" className="h-36 w-full rounded-2xl object-cover sm:h-48" style={{ objectPosition: foto.posicion }} />
          ))}
        </div>
        <div>
          <TituloSeccion antetitulo="Así de fácil" titulo="Tú eliges el destino, nosotros el resto" className="mb-8" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {PASOS.map(({ icono: Icono, titulo: nombre, texto }) => (
              <div key={nombre} className="flex gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-marca-50 text-marca-700">
                  <Icono className="size-5" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">{nombre}</p>
                  <p className="mt-1 text-sm text-slate-500">{texto}</p>
                </div>
              </div>
            ))}
          </div>
          {!usuario ? (
            <BotonEnlace to="/registro" variante="acento" tamano="lg" className="mt-8">
              Crear cuenta gratis
            </BotonEnlace>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default function Inicio() {
  const [parametros] = useSearchParams()
  const tipo = parametros.get('tipo') ?? ''
  const destino = parametros.get('destino') ?? ''
  const { datos: ciudades } = useCatalogo('/ciudades')

  useEffect(() => {
    if (destino) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [destino])

  const ciudadDestino = destino ? ciudades.find((ciudad) => ciudad.codCiudad === Number(destino)) : null
  const titulo = ciudadDestino
    ? `Tu viaje a ${ciudadDestino.nombre} empieza aquí`
    : tipo === 'AEREO'
      ? 'Encuentra tu próximo vuelo'
      : tipo === 'TERRESTRE'
        ? 'Viaja en bus por todo el país'
        : '¿A dónde quieres ir?'
  return (
    <div>
      <Portada titulo={titulo}>
        <Buscador key={`${tipo}-${destino}`} inicial={{ tipo, destino }} />
      </Portada>
      <Promociones />
      <DestinosPopulares />
      <RutasPopulares />
      <Maravillas />
      <AsiDeFacil />
    </div>
  )
}

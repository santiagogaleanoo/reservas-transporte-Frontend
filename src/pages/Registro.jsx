import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BellRing, CircleCheck, ScanLine, Ticket } from 'lucide-react'
import FormularioRegistro from '../components/FormularioRegistro'
import { Tarjeta } from '../components/ui'
import { useSesion } from '../sesion/contexto'
import { FOTO_REGISTRO } from '../util/fotos'

const VENTAJAS = [
  { icono: Ticket, texto: 'Compra tiquetes de avión y bus en minutos' },
  { icono: ScanLine, texto: 'Haz check-in en línea y elige tu silla' },
  { icono: BellRing, texto: 'Recibe avisos si tu viaje cambia' },
  { icono: CircleCheck, texto: 'Consulta todas tus reservas en un solo lugar' },
]

export default function Registro() {
  const { ingresar } = useSesion()
  const navegar = useNavigate()
  const [parametros] = useSearchParams()
  const volver = parametros.get('volver') || '/'

  const alRegistrar = async (_usuario, cuerpo) => {
    await ingresar(cuerpo.email, cuerpo.password, false)
    navegar(volver, { replace: true })
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <aside className="relative h-48 overflow-hidden rounded-3xl bg-noche-900 sm:h-64 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:max-h-[720px] lg:min-h-[520px]">
        <img src={FOTO_REGISTRO.src} alt="" className="absolute inset-0 size-full object-cover" style={{ objectPosition: FOTO_REGISTRO.posicion }} />
        <div className="absolute inset-0 bg-linear-to-t from-noche-950/95 via-noche-950/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
          <p className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">Crea tu cuenta y empieza a viajar</p>
          <ul className="mt-4 hidden space-y-2.5 lg:block">
            {VENTAJAS.map(({ icono: Icono, texto }) => (
              <li key={texto} className="flex items-center gap-2.5 text-sm text-white/90">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur-sm">
                  <Icono className="size-3.5" />
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <Tarjeta className="p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-noche-900">Crea tu cuenta</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          Con tu cuenta compras tiquetes, haces check-in y recibes avisos de tus viajes. ¿Ya tienes una?{' '}
          <Link to={`/ingresar?volver=${encodeURIComponent(volver)}`} className="font-semibold text-marca-700 hover:underline">
            Inicia sesión
          </Link>
        </p>
        <FormularioRegistro alRegistrar={alRegistrar} />
      </Tarjeta>
    </div>
  )
}

import { BotonEnlace } from '../components/ui'
import { FOTO_NO_ENCONTRADA } from '../util/fotos'

export default function NoEncontrada() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="relative overflow-hidden rounded-3xl bg-noche-900 shadow-sm">
        <img src={FOTO_NO_ENCONTRADA.src} alt="" className="h-80 w-full object-cover sm:h-[420px]" style={{ objectPosition: FOTO_NO_ENCONTRADA.posicion }} />
        <div className="absolute inset-0 bg-linear-to-t from-noche-950/90 via-noche-950/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">Error 404</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Esta página no existe</h1>
          <p className="mt-2 max-w-lg text-white/85">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
          <BotonEnlace to="/" variante="acento" tamano="lg" className="mt-6">
            Volver al inicio
          </BotonEnlace>
        </div>
      </div>
    </div>
  )
}

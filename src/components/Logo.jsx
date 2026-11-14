import { Link } from 'react-router-dom'

export default function Logo({ claro = true, compacto = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Ir al inicio">
      <svg viewBox="0 0 64 64" className="size-9 shrink-0" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill={claro ? '#123a5c' : '#0b2239'} />
        <path d="M14 40c10-2 22-10 32-22" stroke="#2dd4bf" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="40" r="5" fill="#fbbf24" />
        <circle cx="48" cy="17" r="5" fill="#fbbf24" />
        <path d="M20 48h26" stroke="#5eead4" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className={`leading-tight ${claro ? 'text-white' : 'text-noche-900'} ${compacto ? 'hidden min-[420px]:block' : ''}`}>
        <span className="block whitespace-nowrap text-[15px] font-extrabold tracking-tight">Reservas de Transporte</span>
        <span className={`hidden whitespace-nowrap text-[11px] font-medium sm:block ${claro ? 'text-marca-200' : 'text-slate-500'}`}>Vuelos y buses en Colombia</span>
      </span>
    </Link>
  )
}

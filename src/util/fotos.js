import portadaGuatapeAereo from '../assets/fotos/hero-guatape-aereo.jpg'
import portadaGuatapeCalle from '../assets/fotos/hero-guatape-calle.jpg'
import portadaAlaAvion from '../assets/fotos/hero-ala-avion.jpg'
import cartagena from '../assets/fotos/cartagena.jpg'
import penol from '../assets/fotos/penol.jpg'
import caribe from '../assets/fotos/caribe.jpg'
import canoCristales from '../assets/fotos/cano-cristales.jpg'
import lasLajas from '../assets/fotos/las-lajas.jpg'
import embalseGuatape from '../assets/fotos/embalse-guatape.jpg'
import paris from '../assets/fotos/paris.jpg'
import hierveElAgua from '../assets/fotos/hierve-el-agua.jpg'
import viajeraAcantilado from '../assets/fotos/viajera-acantilado.jpg'
import viajerosSelfie from '../assets/fotos/viajeros-selfie.jpg'
import viajeraCalle from '../assets/fotos/viajera-calle.jpg'
import viajeraSendero from '../assets/fotos/viajera-sendero.jpg'
import viajeroAtardecer from '../assets/fotos/viajero-atardecer.jpg'
import puertaOrion from '../assets/fotos/puerta-orion.jpg'
import piramide from '../assets/fotos/piramide.jpg'
import alpaca from '../assets/fotos/alpaca.jpg'

export const PORTADAS = [
  { src: portadaGuatapeAereo, lugar: 'Embalse de Guatapé, Antioquia', posicion: 'center 65%' },
  { src: portadaGuatapeCalle, lugar: 'Guatapé, Antioquia', posicion: 'center 45%' },
  { src: portadaAlaAvion, lugar: 'Rumbo a tu próximo destino', posicion: 'center 40%' },
]

export const DESTINOS = [
  { ciudad: 'Cartagena', titulo: 'Cartagena', region: 'Bolívar', texto: 'Murallas, balcones con flores y atardeceres frente al mar Caribe.', src: cartagena, posicion: 'center 35%' },
  { ciudad: 'Medellín', titulo: 'Medellín y El Peñol', region: 'Antioquia', texto: 'La ciudad de la eterna primavera, a dos horas de Guatapé y la Piedra del Peñol.', src: penol, posicion: 'center 30%' },
  { ciudad: 'San Andrés', titulo: 'San Andrés', region: 'Caribe colombiano', texto: 'Arena blanca, palmeras y el mar de los siete colores.', src: caribe, posicion: 'center 60%' },
]

export const MARAVILLAS = [
  { titulo: 'Caño Cristales', region: 'La Macarena, Meta', texto: 'El río de los cinco colores, uno de los paisajes más famosos del país.', src: canoCristales, posicion: 'center 55%' },
  { titulo: 'Puerta de Orión', region: 'Serranía de La Lindosa, Guaviare', texto: 'Un arco de roca natural en medio de la selva del Guaviare.', src: puertaOrion, posicion: 'center 15%' },
  { titulo: 'Santuario de Las Lajas', region: 'Ipiales, Nariño', texto: 'Una iglesia gótica suspendida sobre el cañón del río Guáitara.', src: lasLajas, posicion: 'center 40%' },
  { titulo: 'Embalse de Guatapé', region: 'Antioquia', texto: 'Islas verdes y agua tranquila vistas desde lo alto de El Peñol.', src: embalseGuatape, posicion: 'center 30%' },
]

export const FONDOS_PROMOCION = [paris, hierveElAgua, viajeraAcantilado]

export const MOSAICO_VIAJEROS = [
  { src: viajerosSelfie, alt: 'Pareja de viajeros tomándose una foto frente al mar', posicion: 'center 30%' },
  { src: viajeraCalle, alt: 'Viajera caminando por una calle colorida', posicion: 'center 40%' },
  { src: viajeraSendero, alt: 'Viajera bajando por un sendero hacia el mar', posicion: 'center 50%' },
]

export const FOTO_INGRESO = { src: hierveElAgua, posicion: '62% center' }
export const FOTO_REGISTRO = { src: viajeraAcantilado, posicion: '42% center' }
export const FOTO_NO_ENCONTRADA = { src: viajeroAtardecer, posicion: 'center 45%' }
export const FOTO_SIN_RESULTADOS = { src: alpaca, posicion: '78% center' }
export const FOTO_SIN_RESERVAS = { src: piramide, posicion: 'center 45%' }

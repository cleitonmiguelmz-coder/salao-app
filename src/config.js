// Número do salão que recebe as marcações (formato internacional, sem + nem espaços)
export const WHATSAPP_NUMBER = '258841234567'

// Fotos: coloca os ficheiros em public/images/ com estes nomes exactos
export const IMG = {
  logo: '/images/logo.png',
  hero: '/images/salao.jpg',
  masculino: '/images/corte-masculino.jpg',
  feminino: '/images/corte-feminino.jpg',
  trancas: '/images/trancas.jpg',
  barba: '/images/barba.jpg',
  degrade: '/images/degrade.jpg',
  classico: '/images/corte-classico.jpg',
  americano: '/images/americano.jpg',
  navalhado: '/images/navalhado.jpg',
}

export const SERVICES = [
  { id: 'masculino', name: 'Corte Masculino', desc: 'Degradê, clássico e muito mais.', min: '30 min', price: 500, img: IMG.masculino, cuts: true },
  { id: 'feminino', name: 'Corte Feminino', desc: 'Corte moderno e elegante.', min: '45 min', price: 800, img: IMG.feminino },
  { id: 'trancas', name: 'Tranças', desc: 'Estilos variados e modernos.', min: '1 h', price: 1000, img: IMG.trancas },
  { id: 'barba', name: 'Barba', desc: 'Barba bem feita e estilizada.', min: '30 min', price: 400, img: IMG.barba },
]

export const CUTS = [
  { id: 'degrade', name: 'Degradê', img: IMG.degrade },
  { id: 'classico', name: 'Corte Clássico', img: IMG.classico },
  { id: 'americano', name: 'Americano', img: IMG.americano },
  { id: 'navalhado', name: 'Navalhado', img: IMG.navalhado },
]

export const TIMES = ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00']

// ⚠️ Dados do salão: troca pelos teus (são de exemplo)
export const SALON = {
  phone: '+258 84 123 4567',
  address: 'Av. Eduardo Mondlane, Maputo',
  instagram: 'https://instagram.com/salao',
  facebook: 'https://facebook.com/salao',
  // 0 = Domingo ... 6 = Sábado | [abre, fecha] ou null se fechado
  open: { 0: null, 1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19], 5: [8, 19], 6: [8, 17] },
  hours: [['Segunda a Sexta', '08:00 – 19:00'], ['Sábado', '08:00 – 17:00'], ['Domingo', 'Fechado']],
}
// Um horário só é válido se o salão estiver aberto nessa hora e ainda não tiver passado
export const slotValid = (y, m, d, t) => {
  const h = SALON.open[new Date(y, m, d).getDay()]
  if (!h) return false
  const [hh, mm] = t.split(':').map(Number)
  const x = hh + mm / 60
  return x >= h[0] && x < h[1] && new Date(y, m, d, hh, mm) > new Date()
}
// Primeiro dia (a partir de hoje) com pelo menos um horário válido
export const firstOpen = (from) => {
  for (let i = 0; i < 15; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
    const [y, m, day] = [d.getFullYear(), d.getMonth(), d.getDate()]
    if (TIMES.some((t) => slotValid(y, m, day, t))) return { y, m, d: day }
  }
  return { y: from.getFullYear(), m: from.getMonth(), d: from.getDate() }
}

// ⚠️ Equipa: troca pelos nomes reais (são de exemplo). Fotos em public/images/
// 'services' = ids dos serviços que cada pessoa faz (masculino, feminino, trancas, barba)
export const BARBERS = [
  { id: 'any', name: 'Sem preferência', role: 'O primeiro profissional livre' },
  { id: 'carlos', name: 'Carlos', role: 'Barbeiro · cortes e barba', img: '/images/carlos.jpg', services: ['masculino', 'barba'] },
  { id: 'nelio', name: 'Nélio', role: 'Barbeiro · degradê e navalhado', img: '/images/nelio.jpg', services: ['masculino', 'barba'] },
  { id: 'dulce', name: 'Dulce', role: 'Cabeleireira · cortes e tranças', img: '/images/dulce.jpg', services: ['feminino', 'trancas'] },
]

// ⚠️ Pagamento do sinal: troca pelos números e nomes reais do salão (são de exemplo)
export const DEPOSIT_PERCENT = 50
export const PAYMENT = {
  mpesa: { name: 'M-Pesa', number: '84 123 4567', holder: 'SALAO' },
  emola: { name: 'e-Mola', number: '86 123 4567', holder: 'SALAO' },
}
// Logótipos opcionais: public/images/mpesa.png e public/images/emola.png
export const PAY_OPTIONS = [
  { id: 'mpesa', name: 'M-Pesa', img: '/images/mpesa.png', tag: 'M' },
  { id: 'emola', name: 'e-Mola', img: '/images/emola.png', tag: 'e' },
  { id: 'salao', name: 'Pagar no salão' },
]

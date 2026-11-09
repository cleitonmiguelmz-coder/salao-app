import { useState } from 'react'
import { ArrowLeft, ArrowRight, Search, ChevronRight, ChevronLeft, Clock, CalendarDays, Home, Scissors, Settings, Bell, User, MessageSquareText, Check, Phone, Users, Store } from 'lucide-react'
import { IMG, SERVICES, CUTS, TIMES, WHATSAPP_NUMBER, SALON, firstOpen, slotValid, BARBERS, PAYMENT, PAY_OPTIONS, DEPOSIT_PERCENT } from './config'
import { useStore } from './store'
import { TabBar, Notifs, Bookings, More } from './Extra'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const MESES_C = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const DIAS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
const DIAS_C = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const mt = (n) => n.toLocaleString('pt-PT').replace(/\u00a0/g, '.') + ' MT'

function Img({ src, alt = '', className = '' }) {
  const [ok, setOk] = useState(true)
  return ok
    ? <img src={src} alt={alt} className={className} onError={() => setOk(false)} />
    : <div className={'ph ' + className} />
}

function Avatar({ b }) {
  const [ok, setOk] = useState(true)
  if (b.id === 'any') return <Users size={26} />
  return ok ? <img src={b.img} alt={b.name} onError={() => setOk(false)} /> : <span>{b.name[0]}</span>
}

function PayLogo({ o }) {
  const [ok, setOk] = useState(true)
  if (o.id === 'salao') return <Store size={22} />
  return ok ? <img src={o.img} alt={o.name} onError={() => setOk(false)} /> : <span>{o.tag}</span>
}

function Header({ title, onBack, right }) {
  return (
    <header className="hdr">
      <button className="ic" onClick={onBack} aria-label="Voltar"><ArrowLeft size={24} /></button>
      <h1>{title}</h1>
      <div className="ic">{right}</div>
    </header>
  )
}

function Wa({ size = 120 }) {
  const [ok, setOk] = useState(true)
  return ok
    ? <img src="/images/whatsapp.png" alt="WhatsApp" style={{ width: size, height: size, objectFit: 'contain' }} onError={() => setOk(false)} />
    : <div className="wa" style={{ width: size, height: size }}><Phone size={size * 0.5} fill="#fff" strokeWidth={0} /></div>
}

export default function App() {
  const hoje = new Date()
  const first = firstOpen(hoje)
  const [profile, setProfile] = useStore('salao.profile', { nome: '', whats: '' })
  const [bookings, setBookings] = useStore('salao.bookings', [])
  const [notifs, setNotifs] = useStore('salao.notifs', [{ id: 1, title: 'Bem-vindo ao SALAO', text: 'Escolha um serviço e marque o seu horário em poucos toques.', ts: Date.now(), read: false }])
  const unread = notifs.filter((n) => !n.read).length
  const [barber, setBarber] = useState(BARBERS[0])
  const [pay, setPay] = useState('salao')
  const [copied, setCopied] = useState('')
  const [screen, setScreen] = useState('home')
  const [service, setService] = useState(SERVICES[0])
  const [cut, setCut] = useState(CUTS[0])
  const [view, setView] = useState({ y: first.y, m: first.m })
  const [day, setDay] = useState(first)
  const [time, setTime] = useState(() => TIMES.find((t) => slotValid(first.y, first.m, first.d, t)) || '')
  const [form, setForm] = useState({ nome: profile.nome, whats: profile.whats, obs: '' })

  const addNotif = (title, text) => setNotifs((n) => [{ id: Date.now(), title, text, ts: Date.now(), read: false }, ...n])
  const go = (s) => {
    if (screen === 'notifs' && s !== 'notifs') setNotifs((n) => n.map((x) => ({ ...x, read: true })))
    setScreen(s)
  }
  const cancel = (id) => {
    if (!window.confirm('Cancelar esta marcação?')) return
    setBookings((l) => l.map((b) => (b.id === id ? { ...b, status: 'cancelada' } : b)))
    addNotif('Marcação cancelada', 'A sua marcação foi cancelada. Pode fazer uma nova quando quiser.')
  }
  const pickService = (s) => { setService(s); setBarber(BARBERS[0]); go(s.cuts ? 'cuts' : 'barber') }
  const backFromDate = () => go('barber')

  const dateObj = new Date(day.y, day.m, day.d)
  const iso = `${day.y}-${String(day.m + 1).padStart(2, '0')}-${String(day.d).padStart(2, '0')}`
  const eligible = BARBERS.filter((b) => b.id !== 'any' && b.services.includes(service.id))
  // um horário está livre se o salão está aberto, não passou, e há profissional disponível
  const slotFree = (y, m, d, t) => {
    if (!slotValid(y, m, d, t)) return false
    const k = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const at = bookings.filter((b) => b.date === k && b.time === t && b.status !== 'cancelada')
    if (at.length >= Math.max(eligible.length, 1)) return false
    return barber.id === 'any' || !at.some((b) => b.barberId === barber.id)
  }
  const isTaken = (t) => !slotFree(day.y, day.m, day.d, t)
  const dateShort = `${DIAS_C[dateObj.getDay()]}, ${String(day.d).padStart(2, '0')} ${MESES_C[day.m]}`
  const detail = service.cuts ? `${cut.name} • ${service.min}` : service.min
  const deposit = Math.round((service.price * DEPOSIT_PERCENT) / 100)
  const payTxt = pay === 'salao' ? 'no salão' : `${PAYMENT[pay].name}, sinal de ${mt(deposit)} (envio o comprovativo a seguir)`
  const copy = async (txt, k) => { try { await navigator.clipboard.writeText(txt); setCopied(k); setTimeout(() => setCopied(''), 1500) } catch {} }

  const changeMonth = (n) => {
    const d = new Date(view.y, view.m + n, 1)
    setView({ y: d.getFullYear(), m: d.getMonth() })
  }

  const cells = []
  const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7
  const prevDays = new Date(view.y, view.m, 0).getDate()
  const total = new Date(view.y, view.m + 1, 0).getDate()
  for (let i = offset - 1; i >= 0; i--) cells.push({ d: prevDays - i, out: true })
  for (let d = 1; d <= total; d++) cells.push({ d })
  while (cells.length % 7) cells.push({ d: cells.length - offset - total + 1, out: true })
  const startToday = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())

  const confirmar = () => {
    const msg = `Olá! Quero marcar:\n*${service.name}*${service.cuts ? ' (' + cut.name + ')' : ''}\nData: ${dateShort} • ${time}\nValor: ${mt(service.price)}\nProfissional: ${barber.id === 'any' ? 'Sem preferência' : barber.name}\nPagamento: ${payTxt}\n\nNome: ${form.nome}\nWhatsApp: +258 ${phone}${form.obs ? '\nObs: ' + form.obs : ''}`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
    setBookings((l) => [{ id: Date.now(), service: service.name, detail, price: service.price, date: iso, label: dateShort, time, barberId: barber.id, barber: barber.id === 'any' ? '' : barber.name, pay, deposit: pay === 'salao' ? 0 : deposit, status: 'pendente' }, ...l])
    setProfile((p) => ({ nome: p.nome || form.nome, whats: p.whats || form.whats }))
    addNotif('Marcação enviada', `${service.name} · ${dateShort} às ${time}. Aguarde a confirmação pelo WhatsApp.`)
    go('done')
  }
  const phone = form.whats.replace(/\D/g, '').replace(/^258/, '')
  const phoneOk = /^8[2-7]\d{7}$/.test(phone)
  const nameOk = form.nome.trim().length > 1
  const formOk = nameOk && phoneOk

  return (
    <div className="app">
      {screen === 'home' && (
        <div className="screen home">
          <div className="hero">
            <Img src={IMG.hero} className="hero-img" />
            <div className="hero-top">
              <Img src={IMG.logo} className="logo" />
              <button className="bell" onClick={() => go('notifs')} aria-label="Notificações"><Bell size={22} />{unread > 0 && <i />}</button>
            </div>
            <div className="curve" />
          </div>
          <div className="home-body">
            <h2 className="hello">Olá, {profile.nome.trim().split(' ')[0] || 'Cliente'} <span>👋</span></h2>
            <p className="sub">Encontre o horário perfeito<br />para o seu próximo visual.</p>
            <button className="btn dark" onClick={() => go('services')}><CalendarDays size={20} /> Fazer uma marcação <ArrowRight size={20} /></button>
            <h3 className="sec">Serviços mais procurados</h3>
            <div className="popular">
              {SERVICES.slice(0, 3).map((s) => (
                <button key={s.id} className="pop" onClick={() => pickService(s)}>
                  <Img src={s.img} />
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {screen === 'services' && (
        <div className="screen">
          <Header title="Serviços" onBack={() => go('home')} right={<Search size={24} />} />
          <p className="lead">Escolha o serviço que deseja.</p>
          <div className="list">
            {SERVICES.map((s) => (
              <button key={s.id} className="svc" onClick={() => pickService(s)}>
                <Img src={s.img} />
                <div className="svc-info">
                  <h4>{s.name}</h4>
                  <p>{s.desc}</p>
                  <div className="svc-row"><span><Clock size={18} /> {s.min}</span><b>{mt(s.price)}</b></div>
                </div>
                <ChevronRight size={20} className="chev" />
              </button>
            ))}
          </div>
        </div>
      )}

      {screen === 'cuts' && (
        <div className="screen">
          <Header title="Tipo de Corte" onBack={() => go('services')} />
          <p className="lead">Escolha o tipo de corte.</p>
          <div className="grid">
            {CUTS.map((c) => (
              <button key={c.id} className={'cut' + (cut.id === c.id ? ' sel' : '')} onClick={() => setCut(c)}>
                <Img src={c.img} />
                <span>{c.name}</span>
                {cut.id === c.id && <i className="chk"><Check size={18} strokeWidth={3} /></i>}
              </button>
            ))}
          </div>
          <div className="foot"><button className="btn dark" onClick={() => go('barber')}>Continuar <ArrowRight size={20} /></button></div>
        </div>
      )}

      {screen === 'barber' && (
        <div className="screen">
          <Header title="Profissional" onBack={() => go(service.cuts ? 'cuts' : 'services')} />
          <p className="lead">Escolha quem vai atender.</p>
          <div className="list">
            {[BARBERS[0], ...eligible].map((b) => (
              <button key={b.id} className={'brb' + (barber.id === b.id ? ' sel' : '')} onClick={() => setBarber(b)}>
                <div className="brb-av"><Avatar b={b} /></div>
                <div className="brb-t"><h4>{b.name}</h4><p>{b.role}</p></div>
                {barber.id === b.id && <i className="chk"><Check size={18} strokeWidth={3} /></i>}
              </button>
            ))}
          </div>
          <div className="foot"><button className="btn dark" onClick={() => { setTime(TIMES.find((t) => slotFree(day.y, day.m, day.d, t)) || ''); go('date') }}>Continuar <ArrowRight size={20} /></button></div>
        </div>
      )}

      {screen === 'date' && (
        <div className="screen">
          <Header title="Data e Horário" onBack={backFromDate} />
          <p className="lead c">Escolha a data e o horário ideal.</p>
          <div className="cal">
            <div className="cal-h">
              <button onClick={() => changeMonth(-1)} aria-label="Mês anterior"><ChevronLeft size={24} /></button>
              <b>{MESES[view.m]} {view.y}</b>
              <button onClick={() => changeMonth(1)} aria-label="Mês seguinte"><ChevronRight size={24} /></button>
            </div>
            <div className="cal-g wk">{DIAS.map((d) => <span key={d}>{d}</span>)}</div>
            <div className="cal-g">
              {cells.map((c, i) => {
                const past = !c.out && !TIMES.some((t) => slotFree(view.y, view.m, c.d, t))
                const sel = !c.out && day.y === view.y && day.m === view.m && day.d === c.d
                return (
                  <button key={i} disabled={c.out || past} className={(c.out || past ? 'mute ' : '') + (sel ? 'sel' : '')}
                    onClick={() => {
                      setDay({ y: view.y, m: view.m, d: c.d })
                      setTime(TIMES.find((t) => slotFree(view.y, view.m, c.d, t)) || '')
                    }}>{c.d}</button>
                )
              })}
            </div>
          </div>
          <h3 className="sec pad">Horários disponíveis - {dateShort.replace(',', '')}</h3>
          <div className="times">
            {TIMES.map((t) => <button key={t} disabled={isTaken(t)} className={time === t ? 'sel' : ''} onClick={() => setTime(t)}>{t}</button>)}
          </div>
          <div className="foot"><button className="btn dark" disabled={isTaken(time)} onClick={() => go('confirm')}>Continuar <ArrowRight size={20} /></button></div>
        </div>
      )}

      {screen === 'confirm' && (
        <div className="screen">
          <Header title="Confirme sua Marcação" onBack={() => go('date')} />
          <div className="sum">
            <Img src={service.cuts ? cut.img : service.img} />
            <div>
              <h4>{service.name}</h4>
              <p>{detail}</p>
              <p>{barber.id === 'any' ? 'Sem preferência de profissional' : 'com ' + barber.name}</p>
              <b className="gold">{mt(service.price)}</b>
              <div className="when"><CalendarDays size={18} /> {dateShort.replace(/^(\w+), (\d+) (\w+)$/, '$1, $2 $3')} • {time}</div>
            </div>
          </div>
          <h3 className="sec pad">Seus dados</h3>
          <div className="fields">
            <label><User size={22} /><div><small>Nome completo</small><input placeholder="Ex: João Silva" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div></label>
            <label><Phone size={22} /><div><small>Número do WhatsApp</small><div className="ph-row"><span className="pre">+258</span><input placeholder="84 123 4567" inputMode="tel" value={form.whats} onChange={(e) => setForm({ ...form, whats: e.target.value })} /></div>{form.whats.trim() && !phoneOk && <em className="err">Escreva 9 dígitos, começando por 82 a 87.</em>}</div></label>
            <label><MessageSquareText size={22} /><div><small>Observações (opcional)</small><input placeholder="Ex: Alguma preferência..." value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} /></div></label>
          </div>
          <h3 className="sec pad">Pagamento</h3>
          <div className="pays">
            {PAY_OPTIONS.map((o) => (
              <button key={o.id} className={'pay' + (pay === o.id ? ' sel' : '')} onClick={() => setPay(o.id)}>
                <div className="paylogo"><PayLogo o={o} /></div>
                <div><b>{o.name}</b><small>{o.id === 'salao' ? 'Paga tudo no dia, no salão' : `Sinal de ${mt(deposit)} agora`}</small></div>
                <i className="radio" />
              </button>
            ))}
          </div>
          {pay !== 'salao' && (
            <div className="paybox">
              <p>Envie <b>{mt(deposit)}</b> por {PAYMENT[pay].name} para:</p>
              <div className="num">
                <div><strong>{PAYMENT[pay].number}</strong><small>{PAYMENT[pay].holder}</small></div>
                <button onClick={() => copy(PAYMENT[pay].number.replace(/\s/g, ''), 'n')}>{copied === 'n' ? 'Copiado' : 'Copiar'}</button>
              </div>
              <p className="rest">Restante no salão: {mt(service.price - deposit)}.</p>
            </div>
          )}
          <p className="note">{pay === 'salao' ? 'Ao confirmar, abrimos o WhatsApp com a marcação já escrita. O salão responde com a confirmação da hora.' : 'Pague o sinal e depois envie o comprovativo no WhatsApp. A marcação só fica garantida quando o salão confirmar o pagamento.'}</p>
          <div className="foot"><button className="btn dark sm" disabled={!formOk} onClick={confirmar}>{formOk ? <><img src="/images/whatsapp.png" alt="" style={{ width: 24, height: 24 }} /> Confirmar pelo WhatsApp</> : !nameOk ? 'Escreva o seu nome' : 'Escreva o número do WhatsApp'}</button></div>
        </div>
      )}

      {screen === 'done' && (
        <div className="screen done">
          <Wa />
          <div className="ok"><Check size={34} strokeWidth={3} /></div>
          <h2>Marcação enviada!</h2>
          <p>Sua marcação foi enviada pelo<br />WhatsApp. Em breve entraremos<br />em contacto.</p>
          <div className="foot"><button className="btn outline" onClick={() => go('home')}><Home size={20} fill="currentColor" /> Voltar para o início</button></div>
        </div>
      )}
      {screen === 'notifs' && <Notifs list={notifs} go={go} />}
      {screen === 'bookings' && <Bookings list={bookings} go={go} cancel={cancel} />}
      {screen === 'more' && <More profile={profile} setProfile={setProfile} go={go} unread={unread} />}
      {['home', 'services', 'bookings', 'more'].includes(screen) && <TabBar screen={screen} go={go} />}
    </div>
  )
}

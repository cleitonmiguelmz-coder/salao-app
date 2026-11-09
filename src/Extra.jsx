import { useState, useEffect } from 'react'
import { ArrowLeft, Home, Scissors, CalendarDays, Settings, Bell, Phone, MapPin, Clock, Instagram, Facebook, MessageCircle, Trash2, ChevronRight, User, Pencil, CalendarCheck, CalendarX, Download } from 'lucide-react'
import { SALON, WHATSAPP_NUMBER } from './config'

const mt = (n) => n.toLocaleString('pt-PT').replace(/\u00a0/g, '.') + ' MT'
const ago = (t) => { const m = Math.round((Date.now() - t) / 60000); if (m < 1) return 'agora'; if (m < 60) return `há ${m} min`; const h = Math.round(m / 60); if (h < 24) return `há ${h} h`; return new Date(t).toLocaleDateString('pt-PT') }
const isOpen = () => { const n = new Date(), h = SALON.open[n.getDay()]; if (!h) return false; const x = n.getHours() + n.getMinutes() / 60; return x >= h[0] && x < h[1] }

function NIcon({ t }) {
  const I = /cancelada/i.test(t) ? CalendarX : /enviada/i.test(t) ? CalendarCheck : Scissors
  return <I size={18} />
}

function Hdr({ title, onBack }) {
  return <header className="hdr"><button className="ic" onClick={onBack} aria-label="Voltar"><ArrowLeft size={24} /></button><h1>{title}</h1><div className="ic" /></header>
}

export function TabBar({ screen, go }) {
  const tabs = [['home', 'Início', Home], ['services', 'Serviços', Scissors], ['bookings', 'Marcações', CalendarDays], ['more', 'Mais', Settings]]
  return (
    <nav className="tabs">
      {tabs.map(([id, label, Icon]) => (
        <button key={id} className={screen === id ? 'on' : ''} onClick={() => go(id)}>
          <Icon size={24} fill={screen === id && id === 'home' ? 'currentColor' : 'none'} /><span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

export function Notifs({ list, go }) {
  return (
    <div className="screen lst">
      <Hdr title="Notificações" onBack={() => go('home')} />
      {list.length === 0 ? (
        <div className="empty"><Bell size={40} /><h3>Sem notificações</h3><p>Os avisos das suas marcações aparecem aqui.</p></div>
      ) : (
        <div className="nlist">
          {list.map((n) => (
            <div key={n.id} className={'nitem' + (n.read ? '' : ' un')}>
              <div className="nico"><NIcon t={n.title} /></div>
              <div><h4>{n.title}</h4><p>{n.text}</p><small>{ago(n.ts)}</small></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function Bookings({ list, go, cancel }) {
  const at = (b) => new Date(`${b.date}T${b.time}:00`).getTime()
  const next = list.filter((b) => b.status !== 'cancelada' && at(b) >= Date.now())
  const prev = list.filter((b) => !next.includes(b))
  const card = (b, up) => {
    const cls = b.status === 'cancelada' ? 'x' : up ? '' : 'ok'
    const txt = b.status === 'cancelada' ? 'Cancelada' : up ? 'Pendente' : 'Concluída'
    return (
      <div className="bk" key={b.id}>
        <div className="bk-top"><div><h4>{b.service}</h4><p>{b.detail}{b.barber ? ` · com ${b.barber}` : ''}</p>
<p>{b.pay && b.pay !== 'salao' ? `${b.pay === 'mpesa' ? 'M-Pesa' : 'e-Mola'} · sinal ${mt(b.deposit)}` : 'Pagamento no salão'}</p></div><span className={'chip ' + cls}>{txt}</span></div>
        <div className="when"><CalendarDays size={18} /> {b.label} • {b.time}<b className="gold bk-p">{mt(b.price)}</b></div>
        {up && <div className="bk-act"><button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')}>Falar com o salão</button><button onClick={() => cancel(b.id)}>Cancelar</button></div>}
      </div>
    )
  }
  return (
    <div className="screen lst">
      <Hdr title="Marcações" onBack={() => go('home')} />
      {list.length === 0 ? (
        <div className="empty"><CalendarDays size={40} /><h3>Ainda não tem marcações</h3><p>Escolha um serviço e reserve o seu horário.</p><button className="btn dark" onClick={() => go('services')}>Fazer uma marcação</button></div>
      ) : (<>
        {next.length > 0 && <div className="grp">Próximas</div>}
        {next.map((b) => card(b, true))}
        {prev.length > 0 && <div className="grp">Anteriores</div>}
        {prev.map((b) => card(b, false))}
      </>)}
    </div>
  )
}

export function More({ profile, setProfile, go, unread }) {
  const open = isOpen()
  const [evt, setEvt] = useState(() => window.__pwa || null)
  useEffect(() => { const h = () => setEvt(window.__pwa || null); window.addEventListener('pwa-ready', h); return () => window.removeEventListener('pwa-ready', h) }, [])
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const install = async () => { try { evt.prompt(); await evt.userChoice } catch {} window.__pwa = null; setEvt(null) }
  const set = (k) => (e) => setProfile({ ...profile, [k]: e.target.value })
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SALON.address)}`
  const link = (Icon, title, sub, href) => (
    <a className="row" href={href} target="_blank" rel="noreferrer"><Icon size={22} /><div>{title}<small>{sub}</small></div><ChevronRight size={18} /></a>
  )
  return (
    <div className="screen more">
      <Hdr title="Mais" onBack={() => go('home')} />
      <div className="pro">
        <div className="av">{profile.nome.trim() ? profile.nome.trim()[0].toUpperCase() : <User size={26} />}</div>
        <div style={{ flex: 1 }}>
          <input placeholder="O seu nome" value={profile.nome} onChange={set('nome')} />
          <input className="p2" placeholder="Número do WhatsApp" inputMode="tel" value={profile.whats} onChange={set('whats')} />
        </div>
        <Pencil size={18} className="pen" />
      </div>
      <div className="rows">
        <button className="row" onClick={() => go('notifs')}><Bell size={22} /><div>Notificações</div>{unread > 0 && <span className="badge">{unread}</span>}<ChevronRight size={18} /></button>
      </div>
      <div className="grp">O salão</div>
      <div className="rows">
        <div className="row"><Clock size={22} /><div>
          <div className="hrs"><b>Horário</b><span className={'open' + (open ? '' : ' off')}>{open ? 'Aberto agora' : 'Fechado agora'}</span></div>
          {SALON.hours.map(([d, h]) => <div className="hrs" key={d}><span>{d}</span><span>{h}</span></div>)}
        </div></div>
        {link(MapPin, 'Localização', SALON.address, maps)}
        {link(Phone, 'Ligar', SALON.phone, `tel:${SALON.phone.replace(/\s/g, '')}`)}
        {link(MessageCircle, 'WhatsApp', 'Conversar com o salão', `https://wa.me/${WHATSAPP_NUMBER}`)}
        {link(Instagram, 'Instagram', '@salao', SALON.instagram)}
        {link(Facebook, 'Facebook', 'SALAO', SALON.facebook)}
      </div>
      <div className="grp">Aplicação</div>
      <div className="rows">
        {!standalone && (evt
          ? <button className="row" onClick={install}><Download size={22} /><div>Instalar a app<small>Abre sem o navegador, com ícone no ecrã inicial</small></div><ChevronRight size={18} /></button>
          : <div className="row"><Download size={22} /><div>Instalar a app<small>{ios ? 'Toque em Partilhar e depois em "Adicionar ao ecrã principal"' : 'No menu do navegador (⋮), toque em "Instalar app"'}</small></div></div>)}
        <button className="row danger" onClick={() => { if (window.confirm('Apagar perfil, marcações e notificações deste telemóvel?')) { localStorage.clear(); location.reload() } }}><Trash2 size={22} /><div>Apagar dados deste telemóvel<small>Perfil, marcações e notificações</small></div></button>
      </div>
      <p className="ver">SALAO · versão 1.0.0</p>
    </div>
  )
}

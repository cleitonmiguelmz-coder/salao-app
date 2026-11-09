import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
createRoot(document.getElementById('root')).render(<App />)

// Instalação como app: guarda o pedido do navegador para o botão em "Mais"
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__pwa = e; window.dispatchEvent(new Event('pwa-ready')) })
window.addEventListener('appinstalled', () => { window.__pwa = null; window.dispatchEvent(new Event('pwa-ready')) })
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}

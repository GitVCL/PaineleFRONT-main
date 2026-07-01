import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './index.css'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Limpeza de cache para remover versões antigas com verificação de email
const APP_VERSION = 'v_cleanup_verification_2';
const storedVersion = localStorage.getItem('app_version');

if (storedVersion !== APP_VERSION) {
  console.log('Nova versão detectada. Limpando caches...');
  
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
  
  localStorage.setItem('app_version', APP_VERSION);
  // Recarregar a página para garantir que os novos arquivos sejam baixados
  if (storedVersion) { // Só recarrega se já tinha uma versão anterior
    window.location.reload();
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

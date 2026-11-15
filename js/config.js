/* ==========================================================================
   STANTECH - Configuration de l'API Backend
   ========================================================================== */

// Détection automatique de l'URL du Backend :
// - En local (développement) : pointe vers http://127.0.0.1:8000
// - En production (sur Vercel) : remplacez l'URL ci-dessous par l'URL de votre backend Django hébergé (sur Render, Railway, VPS, etc.)
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// ⚙️ METTEZ ICI L'URL DE VOTRE BACKEND DJANGO UNE FOIS HÉBERGÉ
const PRODUCTION_BACKEND_URL = 'https://siteofficielstantech.onrender.com';

const API_BASE_URL = IS_LOCAL
  ? 'http://127.0.0.1:8000'
  : (localStorage.getItem('STANTECH_API_URL') || PRODUCTION_BACKEND_URL);

window.STANTECH_CONFIG = {
  API_BASE_URL: API_BASE_URL,
  WHATSAPP_NUMBER: '+237674861509',
  CONTACT_EMAIL: 'contact@stantech.com'
};

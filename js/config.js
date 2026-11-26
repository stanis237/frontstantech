/* ==========================================================================
   STANTECH - Configuration de l'API Backend (Architecture Découplée)
   ========================================================================== */

/**
 * Gestion intelligente de l'URL du Backend pour hébergements séparés :
 * 
 * 1. DÉVELOPPEMENT LOCAL :
 *    Si vous ouvrez le frontend en local (localhost / 127.0.0.1), 
 *    les requêtes vont automatiquement vers http://127.0.0.1:8000.
 * 
 * 2. PRODUCTION (Hébergeurs Différents) :
 *    - Frontend hébergé sur : Vercel / Netlify / Cloudflare Pages / GitHub Pages
 *    - Backend hébergé sur  : Render / Railway / Heroku / VPS (Python/Django)
 *    -> Remplacez simplement PRODUCTION_BACKEND_URL ci-dessous par l'URL de votre Backend en ligne.
 * 
 * 3. TEST TEMPORAIRE OU OVERRIDE :
 *    Vous pouvez forcer une URL d'API en ajoutant '?api=https://votre-backend.com' dans l'URL du navigateur,
 *    ou via console JS : localStorage.setItem('STANTECH_API_URL', 'https://votre-backend.com')
 */

const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// ⚙️ URL DE PRODUCTION DU BACKEND DJANGO (À mettre à jour avec l'URL de votre hébergeur Backend)
const PRODUCTION_BACKEND_URL = 'https://stantechbackend.pythonanywhere.com';

// Vérification d'un paramètre URL de test '?api=...'
const urlParams = new URLSearchParams(window.location.search);
const apiParam = urlParams.get('api');
if (apiParam) {
  try {
    const validUrl = new URL(apiParam);
    localStorage.setItem('STANTECH_API_URL', validUrl.origin);
  } catch (e) {
    console.warn('Paramètre d\'API invalide :', apiParam);
  }
}

// Détermination de l'URL de base active
const API_BASE_URL = IS_LOCAL
  ? 'http://127.0.0.1:8000'
  : (localStorage.getItem('STANTECH_API_URL') || PRODUCTION_BACKEND_URL);

window.STANTECH_CONFIG = {
  API_BASE_URL: API_BASE_URL,
  WHATSAPP_NUMBER: '+237674861509',
  WHATSAPP_RAW: '237674861509',
  CONTACT_EMAIL: 'contact@stantechconsulting.site',
  COMPANY_NAME: 'STANTECH CONSULTING',
  SLOGAN: 'Une idée, une solution numérique intelligente qui répond à votre besoin.'
};

# 🚀 STANTECH - Frontend Découplé (Prêt pour Vercel)

Ce dossier `frontend/` contient l'ensemble du site web STANTECH sous forme d'application frontend statique moderne et réactive, totalement découplée du backend Django.

---

## 📁 Structure du Frontend

- `index.html` : Page d'accueil dynamique avec stats animées et sections vedettes (Services, Produits, Réalisations, Apps).
- `services.html` : Catalogue des services d'ingénierie avec filtres par catégorie.
- `realisations.html` : Portfolio des projets réalisés avec tags technologiques.
- `applications.html` : Suite d'applications SaaS, web et mobile avec liens démo et téléchargement direct.
- `boutique.html` : Boutique e-commerce complète avec filtres de catégories, recherche instantanée et ajout au panier.
- `produit.html` : Fiche détaillée d'un produit avec images, spécifications techniques et sélection de quantité.
- `panier.html` : Page complète du panier avec calcul dynamique des totaux et formulaire de validation de commande.
- `a-propos.html` : Présentation de STANTECH, vision, mission et valeurs.
- `contact.html` : Formulaire de contact direct et outil de suivi de commande en temps réel (`ST-XXXX`).
- `css/` : Feuilles de style complètes et responsive (`style.css`, `responsive.css`).
- `js/` :
  - `config.js` : Configuration de l'URL du Backend Django.
  - `api.js` : Client centralisé pour communiquer avec les endpoints REST du backend et gestionnaire de panier (`localStorage`).
  - `main.js` : Contrôleur UI (menu responsive, mode sombre, panier tiroir, modals, notifications toasts).
  - `lucide.min.js` : Librairie d'icônes SVG.
- `images/` : Logos, visuels et icônes.
- `vercel.json` : Configuration optimisée pour Vercel (URLs propres sans extension `.html`, en-têtes de sécurité et cache).

---

## 🌐 Déploiement sur Vercel (En 2 minutes)

### Option 1 : Déploiement via le CLI Vercel
1. Ouvrez un terminal dans le dossier `frontend` :
   ```bash
   cd frontend
   npx vercel
   ```
2. Suivez les étapes à l'écran (choisissez les réglages par défaut).

### Option 2 : Déploiement via GitHub / Tableau de bord Vercel
1. Poussez ce dossier sur votre compte GitHub (soit dans un dépôt dédié au frontend, soit en définissant **Root Directory** = `frontend` dans les paramètres de votre projet Vercel).
2. Cliquez sur **Import** sur [vercel.com](https://vercel.com).
3. Cliquez sur **Deploy** !

---

## 🔗 Connecter le Frontend au Backend

Dans `frontend/js/config.js`, modifiez la variable `PRODUCTION_BACKEND_URL` avec l'URL où est hébergé votre Django :

```javascript
const PRODUCTION_BACKEND_URL = 'https://votre-backend-django.onrender.com';
```

- En local (`localhost`), le frontend communique automatiquement avec `http://127.0.0.1:8000`.
- Une fois en ligne sur Vercel, il communique automatiquement avec votre backend de production.

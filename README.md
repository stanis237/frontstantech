# 🌐 STANTECH CONSULTING - Frontend statique Vercel

Ce dossier `frontend/` contient l'application web frontend moderne et réactive de **STANTECH CONSULTING**, totalement découplée du backend Python et optimisée pour un hébergement statique à haute performance (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

---

## 📂 Structure du Frontend

```
frontend/
├── index.html            # Page d'accueil dynamique avec stats animées et sections vedettes
├── a-propos.html         # Présentation officielle (fondateur, vision, 6 pôles d'expertise, SEO)
├── services.html         # Catalogue des services d'ingénierie avec filtres interactifs
├── realisations.html     # Portfolio des projets réalisés avec tags technologiques
├── applications.html     # Suite d'applications SaaS, web et mobile (Démo, Téléchargement, Doc)
├── boutique.html         # Boutique e-commerce complète avec filtres et ajout au panier
├── produit.html          # Fiche détaillée produit dynamique avec spécifications
├── panier.html           # Page de commande avec validation et calcul des totaux
├── contact.html          # Formulaire de contact / devis et outil de suivi de commande (ST-XXXX)
├── css/
│   ├── style.css         # Thème premium (Vert émeraude & Blanc, mode sombre/clair)
│   └── responsive.css    # Règles responsives pour mobile, tablette et desktop
├── js/
│   ├── config.js         # Configuration de l'URL du Backend Django
│   ├── api.js            # Client API REST unifié et gestionnaire de panier (CartManager)
│   ├── main.js           # Contrôleur d'interface utilisateur (menu, dark mode, modals, toasts)
│   └── lucide.min.js     # Icônes vectorielles SVG
├── images/               # Logos officiels, visuels et photos
├── manifest.json         # Manifeste PWA pour installation sur mobile
├── sw.js                 # Service Worker pour mise en cache hors-ligne
└── vercel.json           # Routage Vercel avec URLs propres sans extension .html
```

---

## 🔗 Connecter le Frontend au Backend

Dans [`frontend/js/config.js`](js/config.js) :

```javascript
// Backend Django déployé indépendamment sur PythonAnywhere
const PRODUCTION_BACKEND_URL = 'https://stantechbackend.pythonanywhere.com';
```

* **En développement local (`localhost`)** : Le frontend se connecte automatiquement à `http://127.0.0.1:8000`.
* **En production sur Vercel** : Le frontend interroge l'API PythonAnywhere définie dans `PRODUCTION_BACKEND_URL`. Le bouton d'administration ouvre `/dashboard/login/` sur le backend.
* **Test rapide sans redéploiement** : Vous pouvez tester n'importe quel backend en ajoutant `?api=https://url-du-backend.com` dans la barre d'adresse de votre navigateur.

---

## 🚀 Déploiement du Frontend sur Vercel (Gratuit)

### Déploiement via le tableau de bord Vercel
1. Rendez-vous sur [vercel.com](https://vercel.com) et connectez votre compte GitHub.
2. Cliquez sur **Add New...** -> **Project**.
3. Importez votre dépôt GitHub `siteofficielstantech`.
4. Sélectionnez le dépôt `stanis237/frontstantech`. Comme ce dépôt contient directement les fichiers du frontend, gardez sa racine comme **Root Directory**.
5. Laissez le framework sur **Other**, sans commande de build, puis déployez le site statique.

### Option 2 : Déploiement via CLI Vercel
```bash
cd frontend
npx vercel
```
Suivez les instructions simples à l'écran en acceptant les options par défaut.

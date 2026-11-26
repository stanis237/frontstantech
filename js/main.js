/* ==========================================================================
   STANTECH - Main Frontend Controller (Compatible Vercel & API Découplée)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCartDrawer();
  initCheckoutModal();
  initCustomCursor();
  initReadProgress();
  initDarkMode();
  initCountdown();
  initLeadPopup();
  initPWA();
  initAppModal();
  initFloatingActions();
  // initApkNotificationBanner(); // Remplacé par le chatbot
  initChatbot();
  initScrollReveal();

  if (window.lucide) {
    lucide.createIcons();
  }
});

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(element => element.classList.add('active'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(element => revealObserver.observe(element));
}


// Toast Notification
function showToast(message, icon = 'check-circle') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  if (window.lucide) {
    lucide.createIcons();
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Navbar Scroll & Mobile Toggle
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('active');
    });

    // Fermer le menu au clic sur un lien de navigation
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });

    // Fermer le menu si on clique en dehors
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });
  }
}

// Initialisation du Système de Boutons Flottants (WhatsApp, Scroll-To-Top, Secret Admin)
function initFloatingActions() {
  if (document.querySelector('.floating-actions-container')) return;

  const phone = (window.STANTECH_CONFIG && window.STANTECH_CONFIG.WHATSAPP_RAW) || '237674861509';
  const apiBase = (window.STANTECH_CONFIG && window.STANTECH_CONFIG.API_BASE_URL) || 'http://127.0.0.1:8000';
  const defaultMsg = encodeURIComponent('Bonjour STANTECH CONSULTING, je souhaite obtenir des informations sur vos solutions technologiques.');

  // Conteneur flottant unique en bas à droite
  const container = document.createElement('div');
  container.className = 'floating-actions-container';

  // 1. Bouton Retour en haut (Scroll-To-Top)
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.id = 'scroll-top-btn';
  scrollTopBtn.className = 'floating-action-btn';
  scrollTopBtn.title = 'Retour en haut de page';
  scrollTopBtn.setAttribute('aria-label', 'Remonter en haut');
  scrollTopBtn.innerHTML = `<i data-lucide="arrow-up"></i>`;
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 2. Bouton WhatsApp avec badge "En Ligne" et Tooltip
  const whatsappBtn = document.createElement('a');
  whatsappBtn.id = 'whatsapp-btn';
  whatsappBtn.className = 'floating-action-btn';
  whatsappBtn.href = `https://wa.me/${phone}?text=${defaultMsg}`;
  whatsappBtn.target = '_blank';
  whatsappBtn.rel = 'noopener noreferrer';
  whatsappBtn.title = 'Discuter sur WhatsApp avec STANTECH';
  whatsappBtn.setAttribute('aria-label', 'Discuter sur WhatsApp');
  whatsappBtn.innerHTML = `
    <span class="whatsapp-online-badge" title="Support en ligne"></span>
    <div class="whatsapp-tooltip">💬 Discuter avec STANTECH</div>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  `;

  // 3. Bouton Admin Discret (ancien #4)
  const adminBtn = document.createElement('a');
  adminBtn.id = 'admin-secret-btn';
  adminBtn.className = 'floating-action-btn';
  adminBtn.href = `${apiBase}/dashboard/login/`;
  adminBtn.target = '_blank';
  adminBtn.rel = 'noopener noreferrer';
  adminBtn.title = 'Accès sécurisé administration';
  adminBtn.setAttribute('aria-label', 'Administration');
  adminBtn.innerHTML = `<i data-lucide="shield-check"></i>`;

  // Assemblage dans le conteneur (Scroll-Top -> WhatsApp -> Admin)
  container.appendChild(scrollTopBtn);
  container.appendChild(whatsappBtn);
  container.appendChild(adminBtn);
  document.body.appendChild(container);

  // Gestion de la visibilité du bouton Scroll-To-Top
  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Notification Flottante d'installation APK / App (Apparaît doucement)
function initApkNotificationBanner() {
  if (sessionStorage.getItem('stantech-apk-dismissed') === 'true') return;
  if (document.querySelector('.apk-floating-notification')) return;

  const notif = document.createElement('div');
  notif.className = 'apk-floating-notification';
  notif.innerHTML = `
    <div class="apk-notif-icon">
      <i data-lucide="smartphone" style="width: 22px; height: 22px;"></i>
    </div>
    <div class="apk-notif-content">
      <div class="apk-notif-title">Application STANTECH</div>
      <div class="apk-notif-desc">Installez l'APK Android ou notre Web App sur votre écran.</div>
    </div>
    <button class="apk-notif-btn" onclick="openAppModal()">Installer</button>
    <button class="apk-notif-close" onclick="closeApkBanner(this)">&times;</button>
  `;
  document.body.appendChild(notif);

  if (window.lucide) {
    lucide.createIcons();
  }

  // Apparition douce après 3.5 secondes
  setTimeout(() => {
    notif.classList.add('visible');
  }, 3500);
}

function closeApkBanner(btn) {
  const notif = btn ? btn.closest('.apk-floating-notification') : document.querySelector('.apk-floating-notification');
  if (notif) {
    notif.classList.remove('visible');
    setTimeout(() => notif.remove(), 400);
  }
  sessionStorage.setItem('stantech-apk-dismissed', 'true');
}

// Cart Drawer
function initCartDrawer() {
  const cartTrigger = document.querySelector('.cart-trigger');
  const cartOverlay = document.querySelector('.cart-drawer-overlay');
  const cartCloseBtn = document.querySelector('.cart-close-btn');

  if (cartTrigger && cartOverlay) {
    cartTrigger.addEventListener('click', () => {
      Cart.updateUI();
      cartOverlay.classList.add('active');
    });
  }

  if (cartCloseBtn && cartOverlay) {
    cartCloseBtn.addEventListener('click', () => {
      cartOverlay.classList.remove('active');
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', (e) => {
      if (e.target === cartOverlay) {
        cartOverlay.classList.remove('active');
      }
    });
  }
}

// Modal Checkout
function openCheckoutModal() {
  const count = Cart.getCount();
  if (count === 0) {
    showToast('Votre panier est vide !', 'alert-circle');
    return;
  }
  const cartOverlay = document.querySelector('.cart-drawer-overlay');
  if (cartOverlay) cartOverlay.classList.remove('active');

  const checkoutModal = document.getElementById('checkout-modal');
  if (checkoutModal) checkoutModal.classList.add('active');
}

function closeCheckoutModal() {
  const checkoutModal = document.getElementById('checkout-modal');
  if (checkoutModal) checkoutModal.classList.remove('active');
}

function initCheckoutModal() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader-2"></i> Traitement de la commande...';
    btn.disabled = true;
    if (window.lucide) lucide.createIcons();

    const formData = new FormData(form);
    const orderData = {
      customer_name: formData.get('customer_name'),
      customer_email: formData.get('customer_email') || '',
      customer_phone: formData.get('customer_phone'),
      delivery_address: formData.get('delivery_address'),
      city: formData.get('city') || 'Abidjan',
      notes: formData.get('notes') || '',
      items: Cart.toCheckoutPayload()
    };

    try {
      const res = await API.submitCheckout(orderData);
      Cart.clear();
      closeCheckoutModal();
      form.reset();

      // Affichage modal ou alerte de succès
      showToast(res.message || 'Commande validée avec succès !', 'check-circle-2');
      alert(`🎉 Félicitations ${orderData.customer_name} !\n\nVotre commande a été enregistrée avec succès.\nNuméro de référence : ${res.order_number}\n\nUn conseiller STANTECH va vous contacter pour confirmer la livraison.`);
      
      // Redirection optionnelle vers l'accueil ou le suivi
      if (window.location.pathname.includes('panier.html')) {
        window.location.href = 'index.html';
      }
    } catch (err) {
      showToast(err.message || 'Erreur lors de la validation', 'alert-circle');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
      if (window.lucide) lucide.createIcons();
    }
  });
}

// Quick View Modal
async function openQuickView(slug) {
  const modal = document.getElementById('quickview-modal');
  const body = modal.querySelector('.modal-body-content');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="text-align: center; padding: 4rem 1rem;">
      <i data-lucide="loader-2" class="spin" style="width: 40px; height: 40px; color: var(--primary);"></i>
      <p style="margin-top: 1rem; color: #64748b;">Chargement des informations...</p>
    </div>
  `;
  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();

  try {
    const product = await API.getProductDetail(slug);
    const imgUrl = API.normalizeImageUrl(product.image_url);
    const priceFormatted = API.formatPrice(product.current_price || product.price);

    body.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center;">
        <div style="border-radius: 12px; overflow: hidden; background: #f8fafc;">
          <img src="${imgUrl}" alt="${product.name}" style="width: 100%; max-height: 380px; object-fit: contain;">
        </div>
        <div>
          <span class="badge badge-primary">${product.category_name || 'Boutique'}</span>
          <h2 style="font-size: 1.6rem; margin: 0.75rem 0; color: var(--text-main);">${product.name}</h2>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-bottom: 1rem;">
            ${priceFormatted}
          </div>
          <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
            ${product.short_description || product.full_description || ''}
          </p>
          <div style="display: flex; gap: 1rem;">
            <button class="btn btn-primary" onclick="Cart.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')}); document.getElementById('quickview-modal').classList.remove('active');">
              <i data-lucide="shopping-bag"></i> Ajouter au Panier
            </button>
            <a href="produit.html?slug=${product.slug}" class="btn btn-outline">
              Voir Fiche Complète
            </a>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    body.innerHTML = `<p style="color: #ef4444; padding: 2rem; text-align: center;">Impossible de charger les détails.</p>`;
  }
}

// Curseur Personnalisé
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, [onclick], label, input, select, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
}

// Barre de Progression
function initReadProgress() {
  const bar = document.getElementById('read-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    bar.style.width = pct + '%';
  });
}

// Dark Mode
function initDarkMode() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('stantech-theme', dark ? 'dark' : 'light');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', dark ? 'sun' : 'moon');
    }
    if (window.lucide) lucide.createIcons();
  }

  const isDark = localStorage.getItem('stantech-theme') === 'dark';
  applyTheme(isDark);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(document.documentElement.getAttribute('data-theme') !== 'dark');
    });
  }
}

// Compte à rebours promo
function initCountdown() {
  const bar = document.getElementById('countdown-bar');
  if (!bar) return;

  let saved = localStorage.getItem('stantech-cd-end');
  if (!saved || Date.now() > parseInt(saved)) {
    saved = Date.now() + 23 * 3600000 + 47 * 60000 + 33000;
    localStorage.setItem('stantech-cd-end', saved);
  }

  function tick() {
    const diff = Math.max(0, parseInt(saved) - Date.now());
    const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    const cdH = document.getElementById('cd-h');
    const cdM = document.getElementById('cd-m');
    const cdS = document.getElementById('cd-s');
    if (cdH) cdH.textContent = h;
    if (cdM) cdM.textContent = m;
    if (cdS) cdS.textContent = s;
    if (diff > 0) setTimeout(tick, 1000);
  }
  tick();
}

// Pop-up Capture Leads
function initLeadPopup() {
  const overlay = document.getElementById('lead-popup-overlay');
  if (!overlay) return;

  window.openLeadPopup = function() {
    if (sessionStorage.getItem('popup-shown')) return;
    sessionStorage.setItem('popup-shown', '1');
    overlay.classList.add('open');
  };

  window.closeLeadPopup = function() {
    overlay.classList.remove('open');
  };

  window.submitLeadPopup = async function() {
    const name = document.getElementById('popup-name').value.trim();
    const email = document.getElementById('popup-email').value.trim();
    const phone = document.getElementById('popup-phone').value.trim();

    if (!name || !email) {
      alert('Veuillez remplir au moins votre nom et email.');
      return;
    }

    try {
      await API.sendContact({
        name: name,
        email: email,
        phone: phone,
        subject: '1ère Consultation Gratuite (Lead Pop-up)',
        service_interest: 'Consultation IT Gratuite',
        message: 'Demande de consultation gratuite soumise via le pop-up promotionnel.'
      });
      closeLeadPopup();
      showToast('Demande envoyée ! Notre équipe vous contactera.', 'check-circle-2');
    } catch (e) {
      closeLeadPopup();
      showToast('Merci ! Votre demande a été notée.', 'check-circle');
    }
  };

  setTimeout(window.openLeadPopup, 35000);
}

// Modal Vidéo
function openVideo(youtubeId) {
  const container = document.getElementById('video-iframe-container');
  const overlay = document.getElementById('video-modal-overlay');
  if (!container || !overlay) return;

  container.innerHTML = `<iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=1" allowfullscreen allow="autoplay"></iframe>`;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeVideo() {
  const container = document.getElementById('video-iframe-container');
  const overlay = document.getElementById('video-modal-overlay');
  if (container) container.innerHTML = '';
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function closeVideoIfOutside(e) {
  if (e.target === document.getElementById('video-modal-overlay')) closeVideo();
}

/* ==========================================================================
   PWA & TÉLÉCHARGEMENT DE L'APPLICATION (Web App & APK)
   ========================================================================== */

let deferredInstallPrompt = null;

// ============================================================
//  CHATBOT INTELLIGENT STANTECH
// ============================================================
function initChatbot() {
  if (document.getElementById('stantech-chatbot')) return;

  // Base de connaissances du chatbot
  const knowledge = {
    greetings: [
      "Bonjour ! 👋 Je suis l'assistant virtuel de STANTECH CONSULTING. Comment puis-je vous aider ?",
      "Bienvenue chez STANTECH ! 🚀 Je suis là pour répondre à vos questions sur nos services, produits et solutions.",
      "Salut ! 😊 Je suis Stan, l'assistant IA de STANTECH. Posez-moi vos questions !"
    ],
    services: {
      keywords: ['service', 'prestation', 'offre', 'expertise', 'que faites', 'quoi faire', 'proposez'],
      response: `🛠️ **Nos services couvrent :**\n\n• **Développement Web & Mobile** — Sites vitrines, e-commerce, apps iOS/Android\n• **Cybersécurité** — Audit, pentest, protection des données\n• **IoT Industriel** — Capteurs connectés, automatisation\n• **Vidéosurveillance** — Installation et monitoring\n• **Réseaux & Systèmes** — Infrastructure, Cloud, maintenance\n• **Automatisation** — Scripts, workflows, bots\n\n👉 [Voir tous nos services](services.html)`
    },
    boutique: {
      keywords: ['boutique', 'achat', 'acheter', 'produit', 'matériel', 'équipement', 'serveur', 'routeur', 'prix', 'tarif', 'commande', 'commander'],
      response: `🛒 **Notre Boutique Tech** propose :\n\n• Serveurs professionnels\n• Passerelles IoT\n• Routeurs & Switches\n• Stations de travail\n• Équipements réseau certifiés\n\nTous nos produits sont livrés avec **garantie** au Cameroun et en Afrique.\n\n👉 [Accéder à la boutique](boutique.html)`
    },
    contact: {
      keywords: ['contact', 'joindre', 'appeler', 'téléphone', 'email', 'mail', 'adresse', 'whatsapp', 'devis', 'rendez-vous'],
      response: `📞 **Contactez-nous :**\n\n• 📱 WhatsApp : **+237 674 861 509**\n• 📧 Email : **contact@stantechconsulting.site**\n• 📍 Localisation : **Douala & Abidjan**\n\n💡 **1ère consultation IT offerte !**\n\n👉 [Formulaire de contact](contact.html)`
    },
    about: {
      keywords: ['propos', 'qui êtes', 'fondateur', 'histoire', 'stantech', 'entreprise', 'société', 'équipe', 'miafo'],
      response: `🏢 **STANTECH CONSULTING** est une entreprise fondée par l'ingénieur **MIAFO TSOPGNY STANIS AUDREY**, spécialisée dans les solutions numériques et technologiques.\n\n• 📅 Fondée en **septembre 2026**\n• 🎯 **120+ projets** livrés avec succès\n• 🌍 Présente au **Cameroun** et à l'**international**\n• ⭐ **98%** de clients satisfaits\n\n👉 [En savoir plus](a-propos.html)`
    },
    realisations: {
      keywords: ['réalisation', 'projet', 'portfolio', 'travaux', 'référence', 'exemple'],
      response: `🏆 **Nos réalisations incluent :**\n\n• Applications web et mobiles sur mesure\n• Systèmes IoT industriels\n• Infrastructures réseau d'entreprise\n• Plateformes SaaS\n• Systèmes de vidéosurveillance\n\nChaque projet est livré avec un suivi qualité rigoureux.\n\n👉 [Voir nos réalisations](realisations.html)`
    },
    applications: {
      keywords: ['application', 'app', 'logiciel', 'saas', 'plateforme', 'web app', 'mobile app'],
      response: `📱 **Notre écosystème d'applications :**\n\n• Applications web responsives\n• Apps mobiles natives (Android/iOS)\n• Applications desktop\n• Plateformes SaaS cloud\n• Solutions d'automatisation\n\n👉 [Découvrir nos applications](applications.html)`
    },
    livraison: {
      keywords: ['livraison', 'livrer', 'expédition', 'délai', 'envoi', 'recevoir'],
      response: `📦 **Livraison :**\n\n• 🇨🇲 **Cameroun** (Douala, Yaoundé, etc.) — 24 à 72h\n• 🇨🇮 **Côte d'Ivoire** (Abidjan) — 3 à 7 jours\n• 🌍 **International** — Sur devis\n\nTous nos produits sont livrés avec garantie et certificat d'authenticité.`
    },
    paiement: {
      keywords: ['paiement', 'payer', 'moyen de paiement', 'mobile money', 'orange money', 'mtn'],
      response: `💳 **Moyens de paiement acceptés :**\n\n• Mobile Money (MTN MoMo, Orange Money)\n• Virement bancaire\n• Paiement à la livraison (Douala)\n• PayPal (international)\n\nContactez-nous pour un devis personnalisé !`
    },
    default: "Je ne suis pas sûr de comprendre votre question. 🤔\n\nVoici ce que je peux vous aider avec :\n• 🛠️ **Services** — Nos expertises IT\n• 🛒 **Boutique** — Matériel technologique\n• 📞 **Contact** — Nous joindre\n• 🏢 **À propos** — Notre histoire\n• 🏆 **Réalisations** — Nos projets\n\nOu tapez votre question autrement !"
  };

  // Suggestions rapides
  const quickReplies = [
    { text: '🛠️ Services', query: 'Quels sont vos services ?' },
    { text: '🛒 Boutique', query: 'Montrez-moi la boutique' },
    { text: '📞 Contact', query: 'Comment vous contacter ?' },
    { text: '🏢 À propos', query: 'Parlez-moi de STANTECH' },
    { text: '📦 Livraison', query: 'Comment fonctionne la livraison ?' },
    { text: '💳 Paiement', query: 'Quels moyens de paiement ?' }
  ];

  // Trouver la réponse appropriée
  function findResponse(input) {
    const lower = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Salutations
    if (/^(bonjour|salut|hello|hi|hey|bonsoir|coucou|yo|bjr|slt)/i.test(lower)) {
      return knowledge.greetings[Math.floor(Math.random() * knowledge.greetings.length)];
    }

    // Remerciements
    if (/merci|thanks|thank/i.test(lower)) {
      return "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions. L'équipe STANTECH est toujours là pour vous.";
    }

    // Au revoir
    if (/^(au revoir|bye|a\+|adieu|a bientot|bonne journee|bonne soiree)/i.test(lower)) {
      return "Au revoir ! 👋 Merci de votre visite. N'hésitez pas à revenir ou à nous contacter directement sur WhatsApp !";
    }

    // Recherche dans les catégories
    const categories = ['services', 'boutique', 'contact', 'about', 'realisations', 'applications', 'livraison', 'paiement'];
    for (const cat of categories) {
      const entry = knowledge[cat];
      if (entry.keywords.some(kw => lower.includes(kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
        return entry.response;
      }
    }

    return knowledge.default;
  }

  // Formater le message (markdown basique -> HTML)
  function formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #059669; text-decoration: underline;">$1</a>')
      .replace(/• /g, '<span style="margin-left: 0.5rem;">• </span>');
  }

  // Créer le HTML du chatbot
  const chatbotHtml = `
    <div id="stantech-chatbot" class="chatbot-wrapper">
      <!-- Bouton flottant -->
      <button class="chatbot-fab" id="chatbot-fab" title="Discuter avec l'assistant STANTECH" aria-label="Ouvrir le chatbot">
        <span class="chatbot-fab-badge">1</span>
        <svg id="chatbot-fab-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg id="chatbot-fab-icon-close" style="display:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Fenêtre de chat -->
      <div class="chatbot-window" id="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar">
              <img src="images/logos.png" alt="STANTECH Bot" onerror="this.style.display='none'">
            </div>
            <div>
              <strong>Stan — Assistant STANTECH</strong>
              <span class="chatbot-status"><span class="chatbot-online-dot"></span> En ligne</span>
            </div>
          </div>
          <button class="chatbot-close" id="chatbot-close" aria-label="Fermer le chat">&times;</button>
        </div>

        <div class="chatbot-messages" id="chatbot-messages">
          <!-- Messages dynamiques ici -->
        </div>

        <div class="chatbot-quick-replies" id="chatbot-quick-replies"></div>

        <div class="chatbot-input-area">
          <input type="text" id="chatbot-input" placeholder="Tapez votre message..." autocomplete="off">
          <button id="chatbot-send" aria-label="Envoyer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatbotHtml);

  // Références DOM
  const fab = document.getElementById('chatbot-fab');
  const window_ = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const messagesContainer = document.getElementById('chatbot-messages');
  const input = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');
  const quickRepliesContainer = document.getElementById('chatbot-quick-replies');
  const fabBadge = fab.querySelector('.chatbot-fab-badge');
  const iconOpen = document.getElementById('chatbot-fab-icon-open');
  const iconClose = document.getElementById('chatbot-fab-icon-close');

  let isOpen = false;
  let isFirstOpen = true;

  // Afficher les suggestions rapides
  function renderQuickReplies() {
    quickRepliesContainer.innerHTML = quickReplies.map(qr =>
      `<button class="chatbot-quick-btn" data-query="${qr.query}">${qr.text}</button>`
    ).join('');

    quickRepliesContainer.querySelectorAll('.chatbot-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        addMessage(query, 'user');
        quickRepliesContainer.style.display = 'none';
        setTimeout(() => {
          addTypingIndicator();
          setTimeout(() => {
            removeTypingIndicator();
            addMessage(findResponse(query), 'bot');
            quickRepliesContainer.style.display = 'flex';
          }, 800 + Math.random() * 600);
        }, 300);
      });
    });
  }

  // Ajouter un message
  function addMessage(text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chatbot-msg chatbot-msg-${type}`;

    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    if (type === 'bot') {
      msgDiv.innerHTML = `
        <div class="chatbot-msg-avatar">
          <img src="images/logos.png" alt="Bot" onerror="this.style.display='none'">
        </div>
        <div class="chatbot-msg-content">
          <div class="chatbot-msg-bubble">${formatMessage(text)}</div>
          <span class="chatbot-msg-time">${time}</span>
        </div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div class="chatbot-msg-content">
          <div class="chatbot-msg-bubble">${text}</div>
          <span class="chatbot-msg-time">${time}</span>
        </div>
      `;
    }

    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Indicateur de frappe
  function addTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'chatbot-msg chatbot-msg-bot chatbot-typing';
    typing.innerHTML = `
      <div class="chatbot-msg-avatar">
        <img src="images/logos.png" alt="Bot" onerror="this.style.display='none'">
      </div>
      <div class="chatbot-msg-content">
        <div class="chatbot-msg-bubble chatbot-typing-bubble">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typing);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeTypingIndicator() {
    const typing = messagesContainer.querySelector('.chatbot-typing');
    if (typing) typing.remove();
  }

  // Envoyer un message
  function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';
    quickRepliesContainer.style.display = 'none';

    setTimeout(() => {
      addTypingIndicator();
      setTimeout(() => {
        removeTypingIndicator();
        addMessage(findResponse(text), 'bot');
        quickRepliesContainer.style.display = 'flex';
      }, 600 + Math.random() * 800);
    }, 300);
  }

  // Toggle chatbot
  function toggleChatbot() {
    isOpen = !isOpen;
    window_.classList.toggle('open', isOpen);
    iconOpen.style.display = isOpen ? 'none' : 'block';
    iconClose.style.display = isOpen ? 'block' : 'none';
    fabBadge.style.display = 'none';

    if (isOpen && isFirstOpen) {
      isFirstOpen = false;
      setTimeout(() => {
        addMessage(knowledge.greetings[0], 'bot');
        renderQuickReplies();
      }, 400);
    }

    if (isOpen) {
      setTimeout(() => input.focus(), 300);
    }
  }

  // Événements
  fab.addEventListener('click', toggleChatbot);
  closeBtn.addEventListener('click', toggleChatbot);
  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  // Animation du badge après 4 secondes
  setTimeout(() => {
    if (!isOpen) {
      fabBadge.style.display = 'flex';
    }
  }, 4000);
}


function initPWA() {
  // Enregistrement du Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('✅ Service Worker PWA actif :', reg.scope);
        })
        .catch((err) => {
          console.warn('Erreur Service Worker :', err);
        });
    });
  }

  // Capture de l'événement d'installation PWA
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    console.log('💡 Application installable détectée (PWA)');
    // Afficher un badge ou bouton d'installation si présent
    const installBtns = document.querySelectorAll('.btn-pwa-install');
    installBtns.forEach(btn => btn.style.display = 'inline-flex');
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    showToast('Application STANTECH installée avec succès !', 'check-circle-2');
  });
}

function initAppModal() {
  if (document.getElementById('download-app-modal')) return;

  const modalHtml = `
    <div class="modal-overlay" id="download-app-modal">
      <div class="modal-content" style="max-width: 580px; padding: 2rem;">
        <button class="modal-close" onclick="closeAppModal()">&times;</button>
        
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="width: 60px; height: 60px; margin: 0 auto 1rem; border-radius: 16px; background: rgba(16, 185, 129, 0.15); color: #059669; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="smartphone" style="width: 32px; height: 32px;"></i>
          </div>
          <span class="badge badge-accent" style="margin-bottom: 0.5rem;">APPLICATION OFFICIELLE STANTECH</span>
          <h2 style="font-size: 1.7rem; color: var(--text-main); margin: 0.4rem 0;">Installer l'Application</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem;">
            Accédez à la boutique, à vos commandes et à nos services directement depuis votre écran d'accueil.
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.2rem;">
          <!-- Option 1 : PWA (Web App Instantanée) -->
          <div style="border: 2px solid #059669; background: rgba(16, 185, 129, 0.05); border-radius: 14px; padding: 1.4rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <strong style="font-size: 1.05rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="zap" style="color: #059669; width: 18px; height: 18px;"></i> Web App Instantanée (PWA)
              </strong>
              <span class="badge badge-primary" style="font-size: 0.75rem;">Recommandé</span>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5;">
              Installation instantanée, sans occuper de stockage. Compatible tout smartphone (Android & iPhone iOS) ainsi que PC & Mac.
            </p>
            <button class="btn btn-primary" style="width: 100%; padding: 0.75rem;" onclick="triggerPWAInstall()">
              <i data-lucide="download-cloud"></i> Installer sur mon appareil
            </button>
          </div>

          <!-- Option 2 : APK Android Direct -->
          <div style="border: 1px solid var(--border-color); background: var(--card-bg); border-radius: 14px; padding: 1.4rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <strong style="font-size: 1.05rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="package" style="color: #059669; width: 18px; height: 18px;"></i> Application Android (Fichier APK)
              </strong>
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Android (.apk)</span>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5;">
              Téléchargez directement le fichier d'installation APK officiel STANTECH sur votre téléphone Android.
            </p>
            <a href="${API.getApkUrl()}" target="_blank" class="btn btn-outline" style="width: 100%; padding: 0.75rem; justify-content: center; display: inline-flex; align-items: center; gap: 0.5rem;" download="STANTECH.apk">
              <i data-lucide="download"></i> Télécharger le fichier APK Android
            </a>
          </div>
        </div>

        <div style="margin-top: 1.5rem; text-align: center;">
          <p style="font-size: 0.8rem; color: var(--text-muted);">
            💡 <em>Sur iPhone (Safari) : Appuyez sur le bouton Partager puis "Sur l'écran d'accueil".</em>
          </p>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (window.lucide) lucide.createIcons();
}

function openAppModal() {
  initAppModal();
  const modal = document.getElementById('download-app-modal');
  if (modal) modal.classList.add('active');
}

function closeAppModal() {
  const modal = document.getElementById('download-app-modal');
  if (modal) modal.classList.remove('active');
}

function triggerPWAInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('Merci d\'avoir installé STANTECH !', 'check-circle-2');
        closeAppModal();
      }
      deferredInstallPrompt = null;
    });
  } else {
    // Si l'invite automatique n'est pas supportée par le navigateur
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      alert("📱 Installation sur iPhone/iPad :\n1. Appuyez sur l'icône Partager (rectangle avec flèche en bas de l'écran)\n2. Faites défiler et choisissez 'Sur l'écran d'accueil'\n3. Appuyez sur 'Ajouter'.");
    } else {
      alert("📱 Installation rapide :\nOuvrez le menu de votre navigateur (les 3 points en haut à droite) puis sélectionnez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.");
    }
  }
}


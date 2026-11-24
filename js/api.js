/* ==========================================================================
   STANTECH - API Client & Cart State Manager (Découplé pour Vercel)
   ========================================================================== */

const API = {
  baseUrl: window.STANTECH_CONFIG ? window.STANTECH_CONFIG.API_BASE_URL : 'http://127.0.0.1:8000',

  // Normalise les URLs des images venant du backend
  normalizeImageUrl(url) {
    if (!url) return 'images/logos.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    return `${this.baseUrl}${cleanUrl}`;
  },

  // Formattage des prix en FCFA
  formatPrice(num) {
    return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
  },

  // Bannière d'état API discrète (pour le réveil sur serveurs gratuits comme Render)
  showApiStatus(message, isSuccess = false) {
    let banner = document.getElementById('api-status-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'api-status-banner';
      banner.className = 'api-status-banner';
      document.body.appendChild(banner);
    }
    banner.className = isSuccess ? 'api-status-banner visible success' : 'api-status-banner visible';
    banner.innerHTML = `<i data-lucide="${isSuccess ? 'check-circle' : 'loader-2'}" class="${isSuccess ? '' : 'spin'}" style="width:16px;height:16px;"></i> <span>${message}</span>`;
    if (window.lucide) lucide.createIcons();
    if (isSuccess) {
      setTimeout(() => {
        banner.classList.remove('visible');
      }, 2500);
    }
  },

  hideApiStatus() {
    const banner = document.getElementById('api-status-banner');
    if (banner) banner.classList.remove('visible');
  },

  // Générateur de lien WhatsApp de commande directe
  getWhatsAppOrderUrl(productName, price) {
    const phone = (window.STANTECH_CONFIG && window.STANTECH_CONFIG.WHATSAPP_RAW) || '237674861509';
    const text = `Bonjour STANTECH CONSULTING, je souhaite commander : *${productName}* (${price}). Est-il immédiatement disponible pour livraison ?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  },

  // Générateur de lien WhatsApp pour demande de devis service
  getWhatsAppServiceUrl(serviceTitle) {
    const phone = (window.STANTECH_CONFIG && window.STANTECH_CONFIG.WHATSAPP_RAW) || '237674861509';
    const text = `Bonjour STANTECH CONSULTING, je souhaite solliciter un devis pour votre prestation : *${serviceTitle}*. Pouvons-nous échanger ?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  },

  // --- Helpers de Skeleton Loaders modernes ---
  getServiceSkeletons(count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-card" style="padding: 2.5rem 2rem;">
          <div class="skeleton" style="width: 60px; height: 60px; border-radius: 12px; margin-bottom: 1rem;"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-line" style="margin-top: 0.5rem;"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line short"></div>
          <div class="skeleton skeleton-btn" style="margin-top: 2rem;"></div>
        </div>
      `;
    }
    return html;
  },

  getProductSkeletons(count = 4) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-card">
          <div class="skeleton skeleton-thumb"></div>
          <div class="skeleton" style="width: 40%; height: 16px;"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-line"></div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top: auto; padding-top: 1rem;">
            <div class="skeleton" style="width: 45%; height: 24px;"></div>
            <div class="skeleton" style="width: 35%; height: 36px; border-radius: 8px;"></div>
          </div>
        </div>
      `;
    }
    return html;
  },

  getRealisationSkeletons(count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-card" style="padding: 0; overflow: hidden;">
          <div class="skeleton" style="width: 100%; height: 220px; border-radius: 0;"></div>
          <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.8rem;">
            <div class="skeleton" style="width: 35%; height: 16px;"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line short"></div>
          </div>
        </div>
      `;
    }
    return html;
  },

  getApplicationSkeletons(count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-card">
          <div class="skeleton" style="width: 50px; height: 50px; border-radius: 12px;"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line short"></div>
          <div style="display: flex; gap: 0.5rem; margin-top: auto;">
            <div class="skeleton" style="flex: 1; height: 38px;"></div>
            <div class="skeleton" style="flex: 1; height: 38px;"></div>
          </div>
        </div>
      `;
    }
    return html;
  },

  // Requête générique avec gestion douce des cold-starts et erreurs
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    // Alerte douce si la requête met plus de 2.2 secondes (serveur en sommeil)
    let slowTimer = setTimeout(() => {
      this.showApiStatus('Connexion au serveur sécurisé STANTECH... (mise en route)', false);
    }, 2200);

    try {
      const response = await fetch(url, config);
      clearTimeout(slowTimer);
      this.hideApiStatus();

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.detail || 'Une erreur est survenue.');
      }
      return data;
    } catch (error) {
      clearTimeout(slowTimer);
      this.hideApiStatus();
      console.warn(`API (${endpoint}) injoignable ou temporairement indisponible:`, error);
      throw error;
    }
  },

  // --- Endpoints de données ---
  async getHomeData() {
    return this.request('/api/home/');
  },

  async getCategories(type = '') {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    return this.request(`/api/categories/${query}`);
  },

  async getServices(categorySlug = '') {
    const query = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : '';
    return this.request(`/api/services/${query}`);
  },

  async getServiceDetail(slug) {
    return this.request(`/api/services/${encodeURIComponent(slug)}/`);
  },

  async getRealisations(categorySlug = '') {
    const query = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : '';
    return this.request(`/api/realisations/${query}`);
  },

  async getApplications(categorySlug = '', platform = '') {
    const params = new URLSearchParams();
    if (categorySlug) params.append('category', categorySlug);
    if (platform) params.append('platform', platform);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/applications/${query}`);
  },

  async getProducts(params = {}) {
    const urlParams = new URLSearchParams();
    if (params.category) urlParams.append('category', params.category);
    if (params.search) urlParams.append('search', params.search);
    if (params.sort) urlParams.append('sort', params.sort);
    if (params.featured) urlParams.append('featured', 'true');
    const query = urlParams.toString() ? `?${urlParams.toString()}` : '';
    return this.request(`/api/products/${query}`);
  },

  async getProductDetail(slug) {
    return this.request(`/api/products/${encodeURIComponent(slug)}/`);
  },

  // Passer commande
  async submitCheckout(orderData) {
    return this.request('/api/checkout/', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  // Suivre une commande
  async trackOrder(orderNumber) {
    return this.request('/api/track-order/', {
      method: 'POST',
      body: JSON.stringify({ order_number: orderNumber })
    });
  },

  // Formulaire de contact
  async sendContact(contactData) {
    return this.request('/api/contact/', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  },

  // Informations sur l'application mobile et PWA
  async getAppInfo() {
    try {
      return await this.request('/api/app-info/');
    } catch (e) {
      return {
        name: 'STANTECH Mobile & Web App',
        version: '1.0.0',
        apk_available: true,
        apk_download_url: '/telecharger-apk/'
      };
    }
  },

  getApkUrl() {
    return `${this.baseUrl}/telecharger-apk/`;
  }
};


/* ==========================================================================
   PANIER LOCAL (CartManager) - Indépendant des cookies de session Django
   ========================================================================== */

const Cart = {
  STORAGE_KEY: 'stantech_cart_v1',

  getItems() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  saveItems(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.updateUI();
  },

  addItem(product, quantity = 1) {
    const items = this.getItems();
    const pid = String(product.id);
    const qty = parseInt(quantity, 10) || 1;

    if (items[pid]) {
      items[pid].quantity += qty;
    } else {
      items[pid] = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.current_price || product.price),
        quantity: qty,
        image_url: API.normalizeImageUrl(product.image_url),
        slug: product.slug
      };
    }

    this.saveItems(items);
    showToast(`${product.name} ajouté au panier !`, 'shopping-bag');

    // Animation bump sur les compteurs du panier
    document.querySelectorAll('.cart-count').forEach(el => {
      el.classList.remove('bump');
      void el.offsetWidth; // trigger reflow
      el.classList.add('bump');
    });

    // Ouvre le drawer du panier
    const drawer = document.querySelector('.cart-drawer-overlay');
    if (drawer) drawer.classList.add('active');
  },

  updateQuantity(productId, newQty) {
    const items = this.getItems();
    const pid = String(productId);
    if (!items[pid]) return;

    if (newQty <= 0) {
      delete items[pid];
      showToast('Article retiré du panier', 'trash-2');
    } else {
      items[pid].quantity = newQty;
    }
    this.saveItems(items);
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateUI();
  },

  getCount() {
    const items = this.getItems();
    return Object.values(items).reduce((acc, it) => acc + (parseInt(it.quantity, 10) || 0), 0);
  },

  getTotal() {
    const items = this.getItems();
    return Object.values(items).reduce((acc, it) => acc + (it.price * it.quantity), 0);
  },

  toCheckoutPayload() {
    const items = this.getItems();
    return Object.values(items).map(it => ({
      product_id: it.id,
      quantity: it.quantity
    }));
  },

  updateUI() {
    const count = this.getCount();
    const total = this.getTotal();
    const items = this.getItems();

    // Mettre à jour les badges
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
    });

    // Mettre à jour le tiroir latéral
    const cartBody = document.querySelector('.cart-body');
    const totalEl = document.querySelector('.cart-drawer-total');

    if (totalEl) {
      totalEl.textContent = API.formatPrice(total);
    }

    if (cartBody) {
      if (count === 0) {
        cartBody.innerHTML = `
          <div style="text-align: center; padding: 3rem 1rem; color: #64748b;">
            <i data-lucide="shopping-bag" style="width: 48px; height: 48px; margin-bottom: 1rem; color: #94a3b8;"></i>
            <p>Votre panier est actuellement vide.</p>
            <a href="boutique.html" class="btn btn-outline" style="margin-top: 1rem;">Visiter la Boutique</a>
          </div>
        `;
      } else {
        let html = '';
        for (const [id, item] of Object.entries(items)) {
          html += `
            <div class="cart-item">
              <img src="${item.image_url}" class="cart-item-img" alt="${item.name}">
              <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${API.formatPrice(item.price)}</div>
                <div class="cart-item-qty">
                  <button class="qty-btn" onclick="Cart.updateQuantity('${id}', ${item.quantity - 1})">-</button>
                  <span>${item.quantity}</span>
                  <button class="qty-btn" onclick="Cart.updateQuantity('${id}', ${item.quantity + 1})">+</button>
                  <button style="margin-left: auto; background: none; border: none; color: #ef4444; cursor: pointer;"
                    onclick="Cart.updateQuantity('${id}', 0)">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }
        cartBody.innerHTML = html;
      }
      if (window.lucide) lucide.createIcons();
    }
  }
};

// Initialisation globale au chargement
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateUI();
});

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

  // Requête générique avec gestion d'erreurs
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

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.detail || 'Une erreur est survenue.');
      }
      return data;
    } catch (error) {
      console.error(`Erreur API (${endpoint}):`, error);
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

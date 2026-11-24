(() => {
  const apiBase = window.STANTECH_CONFIG?.API_BASE_URL || 'http://127.0.0.1:8000';
  let token = null;
  let currentView = 'dashboard';

  const loginScreen = document.getElementById('admin-login');
  const shell = document.getElementById('admin-shell');
  const content = document.getElementById('admin-content');
  const title = document.getElementById('admin-view-title');
  const modal = document.getElementById('admin-modal');
  const modalTitle = document.getElementById('admin-modal-title');
  const modalForm = document.getElementById('admin-modal-form');

  const viewTitles = {
    dashboard: 'Tableau de bord', products: 'Produits', services: 'Services',
    realisations: 'Réalisations', applications: 'Applications', categories: 'Catégories',
    orders: 'Commandes', invoices: 'Factures', messages: 'Messages'
  };

  async function request(path, options = {}) {
    const isFormData = options.body instanceof FormData;
    const headers = {
      'Accept': 'application/json',
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    };
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers
    });
    if (response.status === 204) return null;
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json().catch(() => ({})) : null;
    if (!response.ok) {
      const error = new Error(data?.detail || data?.message || `Erreur serveur (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function downloadFile(path, fallbackName) {
    const response = await fetch(`${apiBase}${path}`, {
      headers: { Authorization: `Token ${token}` }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Téléchargement impossible.');
    }
    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') || '';
    const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || fallbackName;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function uploadFile(file, kind) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);
    const result = await request('/api/admin/upload/', { method: 'POST', body: formData });
    return result.url;
  }

  function showError(message) {
    content.insertAdjacentHTML('afterbegin', `<div class="admin-alert" role="alert">${esc(message)}</div>`);
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  }

  function showShell(show) {
    loginScreen.hidden = show;
    shell.hidden = !show;
  }

  document.getElementById('admin-login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const error = document.getElementById('admin-login-error');
    const submitButton = event.currentTarget.querySelector('button[type="submit"]');
    error.hidden = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Connexion…';

    try {
      const data = await request('/api/admin/login/', {
        method: 'POST',
        body: JSON.stringify({
          username: document.getElementById('admin-username').value,
          password: document.getElementById('admin-password').value
        })
      });

      if (!data.token) throw new Error('Connexion refusée par le serveur.');
      token = data.token;
      showShell(true);
      await loadView('dashboard');
    } catch (err) {
      token = null;
      showShell(false);
      error.textContent = err.message;
      error.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Se connecter';
    }
  });

  document.getElementById('admin-logout').addEventListener('click', async () => {
    try { await request('/api/admin/logout/', { method: 'POST', body: '{}' }); } catch (_) {}
    token = null;
    showShell(false);
    document.getElementById('admin-password').value = '';
  });

  document.querySelectorAll('.admin-nav-item').forEach(button => {
    button.addEventListener('click', () => loadView(button.dataset.view));
  });

  document.getElementById('admin-menu-toggle').addEventListener('click', () => {
    document.querySelector('.admin-sidebar').classList.toggle('open');
  });

  document.getElementById('admin-modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });

  function closeModal() {
    modal.hidden = true;
    modalForm.innerHTML = '';
  }

  async function loadView(view) {
    currentView = view;
    title.textContent = viewTitles[view];
    document.querySelectorAll('.admin-nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === view));
    document.querySelector('.admin-sidebar').classList.remove('open');
    content.innerHTML = '<div class="admin-loader">Chargement…</div>';

    try {
      if (view === 'dashboard') await renderDashboard();
      else if (view === 'orders') await renderOrders();
      else if (view === 'messages') await renderMessages();
      else await renderContent(view);
      if (window.lucide) lucide.createIcons();
    } catch (error) {
      if ([401, 403].includes(error.status) || error.message.includes('Identif') || error.message.includes('Authentication')) {
        token = null;
        showShell(false);
      } else {
        content.innerHTML = `<div class="admin-empty">${esc(error.message)}</div>`;
      }
    }
  }

  async function renderDashboard() {
    const data = await request('/api/admin/dashboard/');
    content.innerHTML = `
      <div class="admin-dashboard-actions">
        <button class="admin-primary-button" data-export="orders.xlsx">Rapport Excel (.xlsx)</button>
        <button class="admin-primary-button admin-button-red" data-export="orders.pdf">Rapport PDF (.pdf)</button>
        <button class="admin-secondary-button" data-export="orders.csv">Exporter CSV</button>
      </div>
      <div class="admin-stats">
        ${[
          ['Produits', data.products, 'shopping-bag'], ['Services', data.services, 'briefcase'],
          ['Réalisations', data.realisations, 'layers'], ['Applications', data.applications, 'layout-grid'],
          ['Commandes', data.orders, 'package'], ['En attente', data.pending_orders, 'clock'],
          ['Messages non lus', data.unread_messages, 'mail'], ['Revenu validé', `${Number(data.revenue).toLocaleString('fr-FR')} FCFA`, 'badge-dollar-sign']
        ].map(([label, value, icon]) => `<article class="admin-stat"><strong>${esc(value)}</strong><span>${esc(label)}</span></article>`).join('')}
      </div>`;

    const sales = data.sales || [];
    const maxRevenue = Math.max(...sales.map(item => Number(item.revenue) || 0), 1);
    content.insertAdjacentHTML('beforeend', `
      <article class="admin-card admin-chart-card">
        <header class="admin-card-header"><div><h3>Analyse des ventes et revenus</h3><span class="admin-muted">Six derniers mois</span></div></header>
        <div class="admin-chart" role="img" aria-label="Chiffre d'affaires mensuel">
          ${sales.map(item => `<div class="admin-chart-column" title="${esc(item.label)} : ${Number(item.revenue).toLocaleString('fr-FR')} FCFA">
            <div class="admin-chart-bar" style="height:${Math.max(4, (Number(item.revenue) / maxRevenue) * 100)}%"></div>
            <span>${esc(item.label)}</span>
            <small>${Number(item.orders) || 0} cmd</small>
          </div>`).join('')}
        </div>
      </article>
      <div class="admin-dashboard-grid">
        <article class="admin-card">
          <header class="admin-card-header"><h3>Dernières commandes</h3><button class="admin-link-button" data-open-view="orders">Voir tout</button></header>
          ${data.recent_orders?.length ? `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>N°</th><th>Client</th><th>Total</th><th>Statut</th><th></th></tr></thead><tbody>
            ${data.recent_orders.map(order => `<tr><td>#${esc(order.order_number)}</td><td>${esc(order.customer_name)}</td><td>${Number(order.total_amount).toLocaleString('fr-FR')} FCFA</td><td>${esc(order.status_display || order.status)}</td><td><button class="admin-action" data-order-detail="${order.id}" title="Détails"><i data-lucide="eye"></i></button></td></tr>`).join('')}
          </tbody></table></div>` : '<div class="admin-empty">Aucune commande.</div>'}
        </article>
        <article class="admin-card">
          <header class="admin-card-header"><h3>Stock faible</h3><button class="admin-link-button" data-open-view="products">Boutique</button></header>
          ${data.low_stock_products?.length ? `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Produit</th><th>Stock</th></tr></thead><tbody>${data.low_stock_products.map(product => `<tr><td>${esc(product.name)}</td><td><strong>${product.stock}</strong></td></tr>`).join('')}</tbody></table></div>` : '<div class="admin-empty">Stocks OK.</div>'}
        </article>
        <article class="admin-card">
          <header class="admin-card-header"><h3>Messages récents</h3><button class="admin-link-button" data-open-view="messages">Voir tout</button></header>
          ${data.recent_messages?.length ? `<div class="admin-recent-list">${data.recent_messages.map(message => `<button class="admin-recent-message" data-message-detail="${message.id}"><strong>${esc(message.name)}</strong><span>${esc(message.subject)}</span><small>${esc(message.message)}</small></button>`).join('')}</div>` : '<div class="admin-empty">Aucun message non lu.</div>'}
        </article>
      </div>`);

    content.querySelectorAll('[data-export]').forEach(button => button.addEventListener('click', async () => {
      try { await downloadFile(`/api/admin/exports/${button.dataset.export}`, `stantech-${button.dataset.export}`); }
      catch (error) { showError(error.message); }
    }));
    content.querySelectorAll('[data-open-view]').forEach(button => button.addEventListener('click', () => loadView(button.dataset.openView)));
    content.querySelectorAll('[data-order-detail]').forEach(button => button.addEventListener('click', () => openOrderDetail(Number(button.dataset.orderDetail))));
    content.querySelectorAll('[data-message-detail]').forEach(button => button.addEventListener('click', () => openMessageDetail(Number(button.dataset.messageDetail))));
    if (window.lucide) lucide.createIcons();
  }

  function listPath(view) {
    return `/api/admin/${view}/`;
  }

  function labelFor(view) {
    return viewTitles[view] || view;
  }

  async function renderContent(view) {
    const data = await request(listPath(view));
    const rows = Array.isArray(data) ? data : (data.results || []);
    const categoryType = { products: 'product', services: 'service', realisations: 'realization', applications: 'application' }[view];
    const categories = categoryType ? await request(`/api/admin/categories/?type=${categoryType}`) : [];
    const columns = {
      products: [['name', 'Produit'], ['category_name', 'Catégorie'], ['price', 'Prix'], ['stock', 'Stock'], ['is_active', 'Statut']],
      services: [['title', 'Service'], ['category_name', 'Catégorie'], ['order', 'Ordre'], ['is_active', 'Statut']],
      realisations: [['title', 'Réalisation'], ['client_name', 'Client'], ['category_name', 'Catégorie'], ['completion_date', 'Date'], ['is_active', 'Statut']],
      applications: [['title', 'Application'], ['platform_display', 'Plateforme'], ['category_name', 'Catégorie'], ['version', 'Version'], ['is_active', 'Statut']],
      categories: [['name', 'Catégorie'], ['type_display', 'Type'], ['slug', 'Slug'], ['icon', 'Icône']],
      invoices: [['invoice_number', 'N° facture'], ['client_name', 'Client'], ['invoice_type_display', 'Type'], ['status_display', 'Statut'], ['total_amount', 'Total']]
    }[view];
    const displayValue = (item, key) => {
      if (key === 'is_active') return item.is_active ? 'Actif' : 'Inactif';
      if (key === 'price') return `${Number(item.current_price || item.price || 0).toLocaleString('fr-FR')} FCFA`;
      return item[key] ?? '—';
    };
    content.innerHTML = `
      <article class="admin-card">
        <header class="admin-card-header">
          <h3>${esc(labelFor(view))} (${rows.length})</h3>
          <div class="admin-toolbar">
            <input id="admin-search" class="admin-input admin-search" type="search" placeholder="Rechercher…" aria-label="Rechercher">
            <button class="admin-primary-button" id="admin-add-item">Ajouter</button>
          </div>
        </header>
        <div class="admin-table-wrap"><table class="admin-table"><thead><tr>
          ${columns.map(([, label]) => `<th>${label}</th>`).join('')}<th>Actions</th>
        </tr></thead><tbody>
          ${rows.length ? rows.map(item => `<tr>
            ${columns.map(([key]) => `<td>${esc(displayValue(item, key))}</td>`).join('')}
            <td>
              ${view === 'invoices' ? `<button class="admin-action" data-invoice-pdf="${item.id}" title="Télécharger le PDF"><i data-lucide="file-text"></i></button>` : ''}
              <button class="admin-action" data-edit-id="${item.id}" title="Modifier"><i data-lucide="pencil"></i></button>
              <button class="admin-action admin-action-danger" data-delete-id="${item.id}" title="Supprimer"><i data-lucide="trash-2"></i></button>
            </td>
          </tr>`).join('') : `<tr><td colspan="${columns.length + 1}" class="admin-empty">Aucun élément.</td></tr>`}
        </tbody></table></div>
      </article>`;

    document.getElementById('admin-add-item').addEventListener('click', () => openContentModal(view, null, categories));
    document.getElementById('admin-search').addEventListener('input', event => {
      const query = event.target.value.toLocaleLowerCase('fr');
      content.querySelectorAll('tbody tr').forEach(row => row.hidden = !row.textContent.toLocaleLowerCase('fr').includes(query));
    });
    content.querySelectorAll('[data-edit-id]').forEach(button => button.addEventListener('click', () => openContentModal(view, rows.find(item => item.id === Number(button.dataset.editId)))));
    content.querySelectorAll('[data-delete-id]').forEach(button => button.addEventListener('click', () => deleteContent(view, Number(button.dataset.deleteId))));
    content.querySelectorAll('[data-invoice-pdf]').forEach(button => button.addEventListener('click', async () => {
      try { await downloadFile(`/api/admin/invoices/${button.dataset.invoicePdf}/pdf/`, 'facture-stantech.pdf'); }
      catch (error) { showError(error.message); }
    }));
  }

  async function deleteContent(view, id) {
    if (!confirm('Supprimer définitivement cet élément ?')) return;
    await request(`${listPath(view)}${id}/`, { method: 'DELETE' });
    loadView(view);
  }

  async function openContentModal(view, item = null, knownCategories = null) {
    const categoryType = { products: 'product', services: 'service', realisations: 'realization', applications: 'application' }[view];
    const categories = knownCategories || (categoryType ? await request(`/api/admin/categories/?type=${categoryType}`) : []);
    const fields = {
      products: [
        ['name', 'Nom du produit', 'text', true, true], ['category', 'Catégorie', 'category'],
        ['price', 'Prix (FCFA)', 'number', true], ['discount_price', 'Prix réduit', 'number'],
        ['stock', 'Stock', 'number'], ['badge', 'Badge', 'text'], ['rating', 'Note sur 5', 'number'],
        ['reviews_count', 'Nombre d’avis', 'number'], ['short_description', 'Description courte', 'textarea', true, true],
        ['full_description', 'Description complète', 'textarea', false, true], ['specs', 'Spécifications (une ligne par entrée)', 'textarea', false, true],
        ['image_url', 'URL de l’image', 'text', false, true], ['image_file', 'Téléverser une image', 'file', false, true],
        ['is_active', 'En vente / actif', 'checkbox'], ['is_featured', 'Produit vedette', 'checkbox']
      ],
      services: [
        ['title', 'Titre du service', 'text', true, true], ['category', 'Catégorie', 'category'], ['icon', 'Icône Lucide', 'text'],
        ['order', 'Ordre d’affichage', 'number'], ['short_description', 'Description courte', 'textarea', true, true],
        ['full_description', 'Description complète', 'textarea', false, true], ['features', 'Fonctionnalités (une par ligne)', 'textarea', false, true],
        ['image_url', 'URL de l’image', 'text', false, true], ['is_active', 'Actif', 'checkbox'], ['is_featured', 'Mettre en avant', 'checkbox']
      ],
      realisations: [
        ['title', 'Titre du projet', 'text', true, true], ['category', 'Domaine', 'category'], ['client_name', 'Nom du client', 'text'],
        ['completion_date', 'Date de livraison', 'date'], ['project_url', 'Lien du projet', 'url', false, true],
        ['short_description', 'Description courte', 'textarea', true, true], ['full_description', 'Description détaillée', 'textarea', false, true],
        ['tech_stack', 'Technologies (séparées par des virgules)', 'text', false, true], ['image_url', 'URL de l’image', 'text', false, true],
        ['is_active', 'Actif', 'checkbox'], ['is_featured', 'Mettre en avant', 'checkbox']
      ],
      applications: [
        ['title', 'Nom de l’application', 'text', true, true], ['category', 'Catégorie', 'category'],
        ['platform', 'Plateforme', 'select', true, false, [['web','Web App'],['mobile','Application mobile'],['desktop','Application desktop'],['saas','Plateforme SaaS'],['ai','IA & Data']]],
        ['version', 'Version', 'text'], ['icon', 'Icône Lucide', 'text'], ['badge', 'Badge', 'text'], ['order', 'Ordre d’affichage', 'number'],
        ['short_description', 'Description courte', 'textarea', true, true], ['full_description', 'Description complète', 'textarea', false, true],
        ['tech_stack', 'Technologies', 'text', false, true], ['image_url', 'URL de l’image', 'text', false, true],
        ['image_file', 'Téléverser une image', 'file', false, true], ['demo_url', 'Lien de démo', 'url', false, true],
        ['download_url', 'Lien de téléchargement', 'url', false, true], ['apk_file', 'Téléverser un APK', 'apk', false, true],
        ['is_active', 'Actif / publié', 'checkbox'], ['is_featured', 'Mettre en avant', 'checkbox']
      ],
      categories: [
        ['name', 'Nom de la catégorie', 'text', true, true],
        ['type', 'Type', 'select', true, false, [['product','Boutique / produits'],['service','Services'],['realization','Réalisations'],['application','Applications']]],
        ['description', 'Description', 'textarea', false, true], ['icon', 'Icône Lucide', 'text']
      ],
      invoices: [
        ['invoice_number', 'Numéro de facture', 'text', true, true],
        ['invoice_type', 'Type de document', 'select', true, false, [['invoice','Facture définitive'],['proforma','Facture proforma'],['quote','Devis / estimation']]],
        ['status', 'Statut', 'select', true, false, [['draft','Brouillon'],['sent','Envoyée au client'],['paid','Payée / encaissée'],['cancelled','Annulée']]],
        ['client_name', 'Nom du client / société', 'text', true, true], ['client_email', 'Email du client', 'email'], ['client_phone', 'Téléphone', 'text'],
        ['client_address', 'Adresse de facturation', 'textarea', false, true], ['city', 'Ville', 'text'], ['issue_date', 'Date d’émission', 'date', true],
        ['due_date', 'Date d’échéance', 'date'], ['payment_method', 'Mode de paiement', 'text'], ['tax_rate', 'Taux de TVA (%)', 'number'],
        ['items_text', 'Lignes (une par ligne : désignation | quantité | prix unitaire HT)', 'textarea', true, true],
        ['notes', 'Notes / mentions légales / RIB', 'textarea', false, true]
      ]
    }[view];

    const renderField = ([name, label, type, required = false, full = false, choices = []]) => {
      let value = item?.[name] ?? '';
      if (name === 'invoice_number' && !item) value = `ST-F-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      if (name === 'issue_date' && !item) value = new Date().toISOString().slice(0, 10);
      if (name === 'items_text') value = (item?.items || []).map(line => `${line.description} | ${line.quantity} | ${line.unit_price}`).join('\n');
      const className = `admin-form-field${full ? ' full' : ''}`;
      if (type === 'checkbox') return `<div class="${className}"><label class="admin-checkbox"><input name="${name}" type="checkbox" ${value ? 'checked' : ''}> ${label}</label></div>`;
      if (type === 'category') return `<div class="${className}"><label>${label}</label><select class="admin-input" name="category"><option value="">— Aucune —</option>${categories.map(category => `<option value="${category.id}" ${Number(value) === category.id ? 'selected' : ''}>${esc(category.name)}</option>`).join('')}</select></div>`;
      if (type === 'file' || type === 'apk') return `<div class="${className}"><label>${label}</label><input class="admin-input" name="${name}" type="file" accept="${type === 'apk' ? '.apk' : 'image/jpeg,image/png,image/webp,image/gif'}"></div>`;
      if (type === 'textarea') return `<div class="${className}"><label>${label}</label><textarea class="admin-input" name="${name}" ${required ? 'required' : ''}>${esc(value)}</textarea></div>`;
      if (type === 'select') return `<div class="${className}"><label>${label}</label><select class="admin-input" name="${name}" ${required ? 'required' : ''}>${choices.map(([choice, text]) => `<option value="${choice}" ${value === choice ? 'selected' : ''}>${text}</option>`).join('')}</select></div>`;
      return `<div class="${className}"><label>${label}</label><input class="admin-input" name="${name}" type="${type}" value="${esc(value)}" ${required ? 'required' : ''} ${type === 'number' ? 'step="any"' : ''}></div>`;
    };

    modalTitle.textContent = `${item ? 'Modifier' : 'Ajouter'} : ${labelFor(view).replace(/s$/, '')}`;
    modalForm.innerHTML = `<div class="admin-form-grid">${fields.map(renderField).join('')}</div>
      <div class="admin-modal-actions"><button type="button" class="admin-secondary-button" id="admin-form-cancel">Annuler</button><button class="admin-primary-button" type="submit">Enregistrer</button></div>`;
    modal.hidden = false;
    document.getElementById('admin-form-cancel').addEventListener('click', closeModal);
    modalForm.onsubmit = async event => {
      event.preventDefault();
      const submit = modalForm.querySelector('button[type="submit"]');
      submit.disabled = true;
      const formData = new FormData(modalForm);
      const payload = Object.fromEntries(formData.entries());
      try {
        for (const [fileField, kind, outputField] of [['image_file', 'image', 'image_url'], ['apk_file', 'apk', 'download_url']]) {
          const file = formData.get(fileField);
          if (file instanceof File && file.size) payload[outputField] = await uploadFile(file, kind);
          delete payload[fileField];
        }
        for (const field of fields) {
          const [name, , type] = field;
          if (type === 'checkbox') payload[name] = formData.has(name);
          if (type === 'number' && payload[name] !== '') payload[name] = Number(payload[name]);
        }
        if (payload.category === '') payload.category = null;
        if (view === 'invoices') {
          payload.items = String(payload.items_text || '').split('\n').map(line => line.split('|').map(part => part.trim())).filter(parts => parts[0]).map(([description, quantity, unit_price]) => ({ description, quantity: Number(quantity || 1), unit_price: String(unit_price || 0) }));
          delete payload.items_text;
          payload.tax_rate = String(payload.tax_rate || '0');
        }
        if (payload.discount_price === '') payload.discount_price = null;
        if (payload.due_date === '') payload.due_date = null;
        if (payload.completion_date === '') payload.completion_date = null;
        await request(item ? `${listPath(view)}${item.id}/` : listPath(view), {
          method: item ? 'PUT' : 'POST', body: JSON.stringify(payload)
        });
        closeModal();
        await loadView(view);
      } catch (error) {
        showError(error.message);
      } finally {
        submit.disabled = false;
      }
    };
  }

  async function renderOrders() {
    const data = await request('/api/admin/orders/');
    const rows = Array.isArray(data) ? data : (data.results || []);
    content.innerHTML = `<article class="admin-card">
      <header class="admin-card-header"><h3>Commandes (${rows.length})</h3>
        <div class="admin-toolbar"><input class="admin-input admin-search" id="order-search" type="search" placeholder="N° commande, client, téléphone">
          <button class="admin-secondary-button" data-export="orders.xlsx">Excel</button><button class="admin-secondary-button" data-export="orders.pdf">PDF</button><button class="admin-secondary-button" data-export="orders.csv">CSV</button>
        </div>
      </header><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>N°</th><th>Client</th><th>Téléphone</th><th>Montant</th><th>Statut</th><th>Actions</th></tr></thead><tbody>
        ${rows.map(order => `<tr><td>#${esc(order.order_number)}</td><td>${esc(order.customer_name)}</td><td>${esc(order.customer_phone)}</td><td>${Number(order.total_amount).toLocaleString('fr-FR')} FCFA</td><td><select class="admin-input admin-order-status" data-order-id="${order.id}">${[['pending','En attente'],['confirmed','Confirmée'],['shipped','Expédiée / en livraison'],['delivered','Livrée'],['cancelled','Annulée']].map(([value,label]) => `<option value="${value}" ${order.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></td><td><button class="admin-action" data-order-detail="${order.id}" title="Détails"><i data-lucide="eye"></i></button><button class="admin-action" data-order-pdf="${order.id}" title="Facture PDF"><i data-lucide="file-text"></i></button></td></tr>`).join('') || '<tr><td colspan="6" class="admin-empty">Aucune commande.</td></tr>'}
      </tbody></table></div></article>`;
    content.querySelector('#order-search').addEventListener('input', event => {
      const query = event.target.value.toLocaleLowerCase('fr');
      content.querySelectorAll('tbody tr').forEach(row => row.hidden = !row.textContent.toLocaleLowerCase('fr').includes(query));
    });
    content.querySelectorAll('[data-export]').forEach(button => button.addEventListener('click', async () => {
      try { await downloadFile(`/api/admin/exports/${button.dataset.export}`, `stantech-${button.dataset.export}`); }
      catch (error) { showError(error.message); }
    }));
    content.querySelectorAll('[data-order-detail]').forEach(button => button.addEventListener('click', () => openOrderDetail(Number(button.dataset.orderDetail))));
    content.querySelectorAll('[data-order-pdf]').forEach(button => button.addEventListener('click', async () => {
      try { await downloadFile(`/api/admin/exports/orders/${button.dataset.orderPdf}.pdf`, `facture-stantech-${button.dataset.orderPdf}.pdf`); }
      catch (error) { showError(error.message); }
    }));
    content.querySelectorAll('.admin-order-status').forEach(select => select.addEventListener('change', async () => {
      try { await request(`/api/admin/orders/${select.dataset.orderId}/status/`, { method: 'PATCH', body: JSON.stringify({ status: select.value }) }); }
      catch (error) { showError(error.message); }
    }));
  }

  async function openOrderDetail(id) {
    const order = await request(`/api/admin/orders/${id}/`);
    modalTitle.textContent = `Commande #${order.order_number}`;
    modalForm.innerHTML = `
      <div class="admin-detail-grid">
        <div><small>Client</small><strong>${esc(order.customer_name)}</strong></div>
        <div><small>Téléphone</small><strong>${esc(order.customer_phone)}</strong></div>
        <div><small>Email</small><strong>${esc(order.customer_email || '—')}</strong></div>
        <div><small>Ville</small><strong>${esc(order.city)}</strong></div>
        <div class="admin-detail-full"><small>Adresse de livraison</small><strong>${esc(order.delivery_address)}</strong></div>
        ${order.notes ? `<div class="admin-detail-full"><small>Notes</small><p>${esc(order.notes)}</p></div>` : ''}
      </div>
      <h3 class="admin-detail-heading">Articles</h3>
      <div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Produit</th><th>Qté</th><th>Prix</th><th>Sous-total</th></tr></thead><tbody>${(order.items || []).map(item => `<tr><td>${esc(item.product_name)}</td><td>${item.quantity}</td><td>${Number(item.price).toLocaleString('fr-FR')} FCFA</td><td>${Number(item.subtotal).toLocaleString('fr-FR')} FCFA</td></tr>`).join('')}</tbody></table></div>
      <div class="admin-modal-actions"><button type="button" class="admin-secondary-button" id="order-invoice-download">Télécharger la facture PDF</button><button type="button" class="admin-primary-button" id="order-detail-close">Fermer</button></div>`;
    modal.hidden = false;
    document.getElementById('order-detail-close').addEventListener('click', closeModal);
    document.getElementById('order-invoice-download').addEventListener('click', async () => {
      try { await downloadFile(`/api/admin/exports/orders/${id}.pdf`, `facture-${order.order_number}.pdf`); }
      catch (error) { showError(error.message); }
    });
  }

  async function renderMessages() {
    const data = await request('/api/admin/messages/');
    const rows = Array.isArray(data) ? data : (data.results || []);
    content.innerHTML = `<article class="admin-card"><header class="admin-card-header"><h3>Messages (${rows.length})</h3><input class="admin-input admin-search" id="message-search" type="search" placeholder="Rechercher un message"></header><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Nom</th><th>Sujet</th><th>Contact</th><th>État</th><th>Actions</th></tr></thead><tbody>${rows.map(message => `<tr><td>${esc(message.name)}</td><td>${esc(message.subject)}</td><td>${esc(message.email || message.phone)}</td><td>${message.is_read ? 'Lu' : 'Non lu'}</td><td><button class="admin-action" data-message-detail="${message.id}" title="Lire"><i data-lucide="eye"></i></button><button class="admin-action admin-action-danger" data-delete-message="${message.id}" title="Supprimer"><i data-lucide="trash-2"></i></button></td></tr>`).join('') || '<tr><td colspan="5" class="admin-empty">Aucun message.</td></tr>'}</tbody></table></div></article>`;
    content.querySelector('#message-search').addEventListener('input', event => {
      const query = event.target.value.toLocaleLowerCase('fr');
      content.querySelectorAll('tbody tr').forEach(row => row.hidden = !row.textContent.toLocaleLowerCase('fr').includes(query));
    });
    content.querySelectorAll('[data-message-detail]').forEach(button => button.addEventListener('click', () => openMessageDetail(Number(button.dataset.messageDetail))));
    content.querySelectorAll('[data-read-id]').forEach(button => button.addEventListener('click', async () => {
      await request(`/api/admin/messages/${button.dataset.readId}/`, { method: 'PATCH', body: JSON.stringify({ is_read: true }) });
      loadView('messages');
    }));
    content.querySelectorAll('[data-delete-message]').forEach(button => button.addEventListener('click', async () => {
      if (confirm('Supprimer ce message ?')) { await request(`/api/admin/messages/${button.dataset.deleteMessage}/`, { method: 'DELETE' }); loadView('messages'); }
    }));
  }

  async function openMessageDetail(id) {
    const message = await request(`/api/admin/messages/${id}/`);
    if (!message.is_read) await request(`/api/admin/messages/${id}/`, { method: 'PATCH', body: JSON.stringify({ is_read: true }) });
    modalTitle.textContent = message.subject;
    modalForm.innerHTML = `<div class="admin-detail-grid"><div><small>Nom</small><strong>${esc(message.name)}</strong></div><div><small>Email</small><strong>${esc(message.email)}</strong></div><div><small>Téléphone</small><strong>${esc(message.phone || '—')}</strong></div><div><small>Service concerné</small><strong>${esc(message.service_interest || '—')}</strong></div><div class="admin-detail-full"><small>Message</small><p class="admin-message-body">${esc(message.message)}</p></div></div><div class="admin-modal-actions"><button type="button" class="admin-primary-button" id="message-detail-close">Fermer</button></div>`;
    modal.hidden = false;
    document.getElementById('message-detail-close').addEventListener('click', () => { closeModal(); loadView('messages'); });
  }

  showShell(false);
})();

// ============================================================
//  MAA JEWELLERS — Admin Dashboard JS (Full-Stack Version)
//  Communicates with Express API using JWT authentication.
// ============================================================

'use strict';

// ── State ──────────────────────────────────────────────────
let editingItemId     = null;
let previewImageData  = null;
let currentAdminCategory = 'all';
let adminItems        = [];

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Check if token is still valid
  const valid = await Api.verifyToken();
  if (valid) {
    showDashboard();
  } else {
    Auth.clearToken();
    showLogin();
  }
  initLoginForm();
  initAddItemForm();
  initSidebar();
  initDragDrop();
});

// ── Login / Logout ─────────────────────────────────────────
function showLogin() {
  document.getElementById('loginPage').style.display    = 'flex';
  document.getElementById('dashboardPage').style.display = 'none';
}

function showDashboard() {
  document.getElementById('loginPage').style.display    = 'none';
  document.getElementById('dashboardPage').style.display = 'flex';
  loadDashboard();
}

function initLoginForm() {
  const form       = document.getElementById('loginForm');
  const errorEl    = document.getElementById('loginError');
  const toggleBtn  = document.getElementById('togglePassword');
  const passInput  = document.getElementById('loginPassword');

  toggleBtn?.addEventListener('click', () => {
    const t = passInput.type === 'password' ? 'text' : 'password';
    passInput.type   = t;
    toggleBtn.textContent = t === 'password' ? '👁' : '🙈';
  });

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const username  = document.getElementById('loginUsername').value.trim();
    const password  = passInput.value;
    const submitBtn = form.querySelector('[type=submit]');
    submitBtn.textContent = 'Verifying...';
    submitBtn.disabled    = true;
    errorEl.classList.remove('show');

    try {
      const res = await Api.login(username, password);
      Auth.setToken(res.token);
      showDashboard();
      showToast('Welcome back, Owner! ✨', 'success');
    } catch (err) {
      errorEl.textContent = err.message || 'Invalid credentials. Please try again.';
      errorEl.classList.add('show');
      passInput.value = '';
      setTimeout(() => errorEl.classList.remove('show'), 4000);
    } finally {
      submitBtn.textContent = 'Enter Dashboard';
      submitBtn.disabled    = false;
    }
  });
}

function logout() {
  Auth.clearToken();
  showLogin();
  showToast('Logged out successfully', 'info');
}

// ── Dashboard Load ─────────────────────────────────────────
async function loadDashboard() {
  try {
    adminItems = await Api.getProducts();
    renderStats();
    renderSidebarCounts();
    renderAdminGrid();
  } catch (err) {
    showToast('Could not connect to server. Is it running?', 'error');
  }
}

function renderStats() {
  document.getElementById('statTotal').textContent = adminItems.length;
  const counts = {};
  CATEGORIES.forEach(c => counts[c.id] = 0);
  adminItems.forEach(i => { if (counts[i.category] !== undefined) counts[i.category]++; });
  document.getElementById('statBridal').textContent     = counts['bridal-collection'] || 0;
  document.getElementById('statNewArrivals').textContent = counts['new-arrivals']      || 0;
  document.getElementById('statTrendy').textContent      = counts['most-trendy']       || 0;
}

function renderSidebarCounts() {
  const allCount = document.getElementById('countAll');
  if (allCount) allCount.textContent = adminItems.length;
  CATEGORIES.forEach(cat => {
    const el = document.getElementById('count_' + cat.id);
    if (el) el.textContent = adminItems.filter(i => i.category === cat.id).length;
  });
}

// ── Sidebar ────────────────────────────────────────────────
function switchAdminCategory(catId) {
  currentAdminCategory = catId;
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.sidebar-link[data-cat="${catId}"]`)?.classList.add('active');
  const heading = document.getElementById('currentViewLabel');
  if (heading) heading.textContent = catId === 'all' ? 'All Items' : (CATEGORIES.find(c => c.id === catId)?.label || catId);
  renderAdminGrid();
}

function initSidebar() {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebarOverlay');
  toggleBtn?.addEventListener('click', () => { sidebar?.classList.toggle('open'); overlay?.classList.toggle('visible'); });
  overlay?.addEventListener('click',   () => { sidebar?.classList.remove('open'); overlay?.classList.remove('visible'); });
}

// ── Admin Grid ─────────────────────────────────────────────
function renderAdminGrid() {
  const grid = document.getElementById('adminGrid');
  if (!grid) return;

  let filtered = currentAdminCategory === 'all'
    ? adminItems
    : adminItems.filter(i => i.category === currentAdminCategory);

  const searchVal = document.getElementById('adminSearch')?.value?.toLowerCase() || '';
  if (searchVal) filtered = filtered.filter(i =>
    i.name.toLowerCase().includes(searchVal) ||
    (i.description || '').toLowerCase().includes(searchVal) ||
    (i.price || '').toLowerCase().includes(searchVal)
  );

  const countLabel = document.getElementById('itemCountLabel');
  if (countLabel) countLabel.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;

  grid.innerHTML = '';

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">💎</div><p>No items yet. Add your first jewellery piece!</p></div>`;
    return;
  }

  filtered.forEach(item => {
    const id   = item._id || item.id;
    const card = document.createElement('div');
    card.className = 'admin-jewel-card';
    const imgHTML = item.image
      ? `<img class="admin-card-img" src="${escHtml(item.image)}" alt="${escHtml(item.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const placeholderStyle = item.image ? 'style="display:none"' : '';

    card.innerHTML = `
      ${imgHTML}
      <div class="admin-card-img-placeholder" ${placeholderStyle}>💍</div>
      <div class="admin-card-body">
        <div class="jewel-card-category" style="margin-bottom:8px;">${getCategoryIcon(item.category)} ${getCategoryLabel(item.category)}</div>
        <div class="admin-card-title">${escHtml(item.name)}</div>
        ${item.price ? `<div style="font-family:'Cinzel',serif;font-size:0.78rem;color:var(--gold);margin:4px 0;">${escHtml(item.price)}</div>` : ''}
        <div class="jewel-card-desc" style="font-size:0.82rem;margin:6px 0 0;">${escHtml(item.description || '')}</div>
        <div class="admin-card-actions">
          <button class="btn btn-outline btn-sm" onclick="openEditModal('${id}')">✏ Edit</button>
          <button class="btn btn-danger"          onclick="confirmDelete('${id}', '${escHtml(item.name).replace(/'/g,"\\'")}')">🗑 Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ── Add / Edit Modal ───────────────────────────────────────
function openAddModal() {
  editingItemId    = null;
  previewImageData = null;
  document.getElementById('modalTitle').textContent = 'Add New Jewellery Item';
  document.getElementById('itemForm').reset();
  resetImagePreview();
  document.getElementById('itemModalOverlay').classList.add('open');
}

function openEditModal(itemId) {
  const item = adminItems.find(i => (i._id || i.id) === itemId);
  if (!item) return;
  editingItemId    = item._id || item.id;
  previewImageData = item.image || null;

  document.getElementById('modalTitle').textContent = 'Edit Jewellery Item';
  document.getElementById('itemName').value         = item.name        || '';
  document.getElementById('itemCategory').value     = item.category    || 'new-arrivals';
  document.getElementById('itemDesc').value         = item.description || '';
  document.getElementById('itemPrice').value        = item.price       || '';
  document.getElementById('itemImageUrl').value     = item.image       || '';

  if (item.image) {
    document.getElementById('imagePreviewWrap').classList.add('visible');
    document.getElementById('imagePreview').src = item.image;
  } else {
    resetImagePreview();
  }
  document.getElementById('itemModalOverlay').classList.add('open');
}

function closeItemModal() {
  document.getElementById('itemModalOverlay')?.classList.remove('open');
  editingItemId = null;
  previewImageData = null;
}

function initAddItemForm() {
  // File upload → base64
  const fileInput = document.getElementById('itemImage');
  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); fileInput.value = ''; return; }
    previewImageData = await fileToBase64(file);
    showImagePreview(previewImageData);
    document.getElementById('itemImageUrl').value = '';
  });

  // URL input → live preview
  document.getElementById('itemImageUrl')?.addEventListener('input', e => {
    const url = e.target.value.trim();
    if (url) { previewImageData = url; showImagePreview(url); }
    else { resetImagePreview(); previewImageData = null; }
  });

  // Remove preview button
  document.getElementById('removeImageBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    resetImagePreview();
    document.getElementById('itemImage').value    = '';
    document.getElementById('itemImageUrl').value = '';
    previewImageData = null;
  });

  document.getElementById('itemForm')?.addEventListener('submit', saveItem);
  document.getElementById('adminSearch')?.addEventListener('input', renderAdminGrid);
}

function showImagePreview(src) {
  const wrap = document.getElementById('imagePreviewWrap');
  const img  = document.getElementById('imagePreview');
  wrap.classList.add('visible');
  img.src = src;
}

function resetImagePreview() {
  document.getElementById('imagePreviewWrap')?.classList.remove('visible');
  const img = document.getElementById('imagePreview');
  if (img) img.src = '';
  previewImageData = null;
}

async function saveItem(e) {
  e.preventDefault();
  const name        = document.getElementById('itemName').value.trim();
  const category    = document.getElementById('itemCategory').value;
  const description = document.getElementById('itemDesc').value.trim();
  const price       = document.getElementById('itemPrice').value.trim();

  if (!name) { showToast('Please enter an item name', 'error'); return; }

  const saveBtn = document.getElementById('saveItemBtn');
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled    = true;

  const payload = { name, category, description, price, image: previewImageData || '' };

  try {
    if (editingItemId) {
      await Api.updateProduct(editingItemId, payload);
      showToast(`"${name}" updated successfully ✨`, 'success');
    } else {
      await Api.addProduct(payload);
      showToast(`"${name}" added to collection ✨`, 'success');
    }
    closeItemModal();
    await loadDashboard();
  } catch (err) {
    showToast(err.message || 'Failed to save item', 'error');
  } finally {
    saveBtn.textContent = 'Save Item';
    saveBtn.disabled    = false;
  }
}

// ── Delete ─────────────────────────────────────────────────
function confirmDelete(itemId, itemName) {
  document.getElementById('deleteItemName').textContent = itemName;
  document.getElementById('confirmDeleteBtn').onclick   = async () => {
    try {
      await Api.deleteProduct(itemId);
      document.getElementById('deleteModalOverlay').classList.remove('open');
      showToast(`"${itemName}" removed from collection`, 'info');
      await loadDashboard();
    } catch (err) {
      showToast(err.message || 'Failed to delete item', 'error');
    }
  };
  document.getElementById('deleteModalOverlay').classList.add('open');
}
function closeDeleteModal() { document.getElementById('deleteModalOverlay')?.classList.remove('open'); }

// ── Drag & Drop File Upload ────────────────────────────────
function initDragDrop() {
  const zone = document.getElementById('uploadZone');
  if (!zone) return;
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', ()  => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', async e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
    previewImageData = await fileToBase64(file);
    showImagePreview(previewImageData);
    document.getElementById('itemImageUrl').value = '';
  });
}

function goToCustomerView() { window.open('index.html', '_blank'); }

// Close modals on overlay click
document.addEventListener('click', e => {
  if (e.target.id === 'itemModalOverlay')   closeItemModal();
  if (e.target.id === 'deleteModalOverlay') closeDeleteModal();
});

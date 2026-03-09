// ============================================================
//  MAA JEWELLERS — Customer Page JS (Full-Stack Version)
//  Fetches products from GET /api/products
// ============================================================

'use strict';

// ── State ──────────────────────────────────────────────────
let activeCategory = 'all';
let allItems       = [];
let wishlist       = [];

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  wishlist = Wishlist.get();
  renderCategoryTabs();
  updateWishlistCount();
  initScrollEffects();
  initWishlistPanel();
  initMobileMenu();
  initHeroParallax();
  await loadProducts('all');
});

// ── Load Products from API ─────────────────────────────────
async function loadProducts(catId) {
  const grid = document.getElementById('jewelsGrid');
  if (!grid) return;

  grid.innerHTML = '<div class="spinner"></div>';

  try {
    const category = catId === 'all' ? '' : catId;
    allItems = await Api.getProducts(category);

    const heading = document.getElementById('sectionHeadingText');
    if (heading) {
      heading.textContent = catId === 'all'
        ? 'Our Royal Collection'
        : (CATEGORIES.find(c => c.id === catId)?.label || 'Collection');
    }

    renderProducts(allItems);
  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">⚠️</div>
        <p>Could not connect to server.<br>
        <span style="font-size:0.85rem;color:rgba(201,168,76,0.4);">Make sure the server is running on port 5000.</span></p>
      </div>`;
    console.error('Load products error:', err);
  }
}

// ── Render Products Grid ───────────────────────────────────
function renderProducts(items) {
  const grid = document.getElementById('jewelsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!items.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">💎</div>
        <p>No items in this collection yet.<br>New arrivals coming soon.</p>
      </div>`;
    return;
  }

  items.forEach((item, i) => grid.appendChild(createProductCard(item, i)));
}

// ── Product Card ───────────────────────────────────────────
function createProductCard(item, delay = 0) {
  const id        = item._id || item.id;
  const inWishlist = Wishlist.has(id);
  const card      = document.createElement('div');
  card.className  = 'jewel-card';
  card.style.animation = `fade-up 0.6s ease ${delay * 0.07}s both`;

  const imgHTML = item.image
    ? `<img class="jewel-card-img" src="${escHtml(item.image)}" alt="${escHtml(item.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  const placeholderStyle = item.image ? 'style="display:none"' : '';

  // Price badge
  const priceHTML = item.price
    ? `<div style="font-family:'Cinzel',serif;font-size:0.82rem;color:var(--gold-bright);letter-spacing:0.06em;margin-top:6px;font-weight:600;">${escHtml(item.price)}</div>`
    : '';

  card.innerHTML = `
    ${imgHTML}
    <div class="jewel-card-img-placeholder" ${placeholderStyle}>💍<span>Maa Jewellers</span></div>
    <div class="jewel-card-body">
      <div class="jewel-card-category">${getCategoryIcon(item.category)} ${getCategoryLabel(item.category)}</div>
      <div class="jewel-card-title">${escHtml(item.name)}</div>
      <div class="jewel-card-desc">${escHtml(item.description)}</div>
      ${priceHTML}
      <div class="jewel-card-actions">
        <button class="wishlist-toggle ${inWishlist ? 'saved' : ''}" data-id="${id}">
          ${inWishlist ? '♥ Saved' : '♡ Save to Wishlist'}
        </button>
        <button class="btn btn-outline btn-sm" onclick="openItemDetail('${id}')">View</button>
      </div>
    </div>`;

  card.querySelector('.wishlist-toggle').addEventListener('click', e => {
    e.stopPropagation();
    toggleWishlist(id, e.currentTarget);
  });
  card.addEventListener('click', e => {
    if (!e.target.closest('button')) openItemDetail(id);
  });

  return card;
}

// ── Category Tabs ──────────────────────────────────────────
function renderCategoryTabs() {
  const container = document.getElementById('categoryTabs');
  if (!container) return;

  const makeTab = (id, icon, label, active) => {
    const btn = document.createElement('button');
    btn.className = `category-tab${active ? ' active' : ''}`;
    btn.innerHTML = `<span class="tab-icon">${icon}</span> ${label}`;
    btn.onclick   = () => switchCategory(id, btn);
    return btn;
  };

  container.appendChild(makeTab('all', '💎', 'All Collections', true));
  CATEGORIES.forEach(cat => container.appendChild(makeTab(cat.id, cat.icon, cat.label, false)));
}

function switchCategory(catId, tabEl) {
  activeCategory = catId;
  document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');
  loadProducts(catId);
  const section = document.getElementById('productsSection');
  if (section) window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 130, behavior: 'smooth' });
}

// ── Wishlist ───────────────────────────────────────────────
function toggleWishlist(itemId, btn) {
  const added = Wishlist.toggle(itemId);
  wishlist    = Wishlist.get();
  if (btn) { btn.textContent = added ? '♥ Saved' : '♡ Save to Wishlist'; btn.classList.toggle('saved', added); }
  showToast(added ? 'Added to wishlist ♥' : 'Removed from wishlist', added ? 'success' : 'info');
  updateWishlistCount();
  renderWishlistPanel();
}

function updateWishlistCount() {
  const badge = document.getElementById('wishlistCount');
  if (badge) badge.textContent = Wishlist.get().length;
}

function initWishlistPanel() {
  const panel   = document.getElementById('wishlistPanel');
  const openBtn = document.getElementById('openWishlist');
  const closeBtn = document.getElementById('closeWishlist');
  if (!panel) return;
  openBtn?.addEventListener('click',  () => { renderWishlistPanel(); panel.classList.add('open'); });
  closeBtn?.addEventListener('click', () => panel.classList.remove('open'));
  document.addEventListener('click', e => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && !openBtn?.contains(e.target))
      panel.classList.remove('open');
  });
}

function renderWishlistPanel() {
  const container = document.getElementById('wishlistItems');
  if (!container) return;
  const wl = Wishlist.get();
  container.innerHTML = '';

  if (!wl.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🤍</div><p>Your wishlist is empty.<br>Browse and save items you love.</p></div>`;
    return;
  }

  // Match wishlist IDs to loaded items
  wl.forEach(id => {
    const item = allItems.find(i => (i._id || i.id) === id);
    if (!item) return;
    const el = document.createElement('div');
    el.className = 'wishlist-item';
    const imgHTML = item.image
      ? `<img src="${escHtml(item.image)}" alt="${escHtml(item.name)}" onerror="this.style.display='none'">`
      : `<div class="wishlist-item-placeholder">💍</div>`;
    el.innerHTML = `
      ${imgHTML}
      <div class="wishlist-item-info">
        <div class="wishlist-item-name">${escHtml(item.name)}</div>
        <div class="wishlist-item-cat">${getCategoryLabel(item.category)}</div>
        ${item.price ? `<div style="font-family:'Cinzel',serif;font-size:0.75rem;color:var(--gold);margin-top:2px;">${escHtml(item.price)}</div>` : ''}
        <button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="openItemDetail('${id}')">View Details</button>
      </div>
      <button class="wishlist-remove" data-id="${id}" title="Remove">✕</button>`;
    el.querySelector('.wishlist-remove').addEventListener('click', () => {
      Wishlist.toggle(id);
      wishlist = Wishlist.get();
      updateWishlistCount();
      renderWishlistPanel();
      const gridBtn = document.querySelector(`.wishlist-toggle[data-id="${id}"]`);
      if (gridBtn) { gridBtn.textContent = '♡ Save to Wishlist'; gridBtn.classList.remove('saved'); }
    });
    container.appendChild(el);
  });
}

// ── Item Detail Modal ──────────────────────────────────────
async function openItemDetail(itemId) {
  const modal = document.getElementById('itemDetailModal');
  if (!modal) return;

  // Try local cache first, then fetch from API
  let item = allItems.find(i => (i._id || i.id) === itemId);
  if (!item) {
    try { item = await Api.getProduct(itemId); } catch { return; }
  }

  const id = item._id || item.id;
  const inWishlist = Wishlist.has(id);
  const imgHTML = item.image
    ? `<img class="item-detail-img" src="${escHtml(item.image)}" alt="${escHtml(item.name)}" onerror="this.style.display='none'">`
    : `<div style="height:180px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:var(--maroon);border-radius:4px;margin-bottom:20px;">💍</div>`;

  document.getElementById('itemDetailContent').innerHTML = `
    ${imgHTML}
    <div class="item-detail-meta">
      <span class="jewel-card-category">${getCategoryIcon(item.category)} ${getCategoryLabel(item.category)}</span>
      ${item.price ? `<span style="font-family:'Cinzel',serif;font-size:0.85rem;color:var(--gold-bright);font-weight:600;">${escHtml(item.price)}</span>` : ''}
    </div>
    <div class="item-detail-title">${escHtml(item.name)}</div>
    <div class="item-detail-desc">${escHtml(item.description)}</div>
    <div style="margin-top:20px;display:flex;gap:12px;">
      <button class="btn btn-gold" id="detailWishlistBtn" onclick="toggleDetailWishlist('${id}')">
        ${inWishlist ? '♥ Saved to Wishlist' : '♡ Save to Wishlist'}
      </button>
    </div>`;
  modal.classList.add('open');
}

function toggleDetailWishlist(itemId) {
  const added = Wishlist.toggle(itemId);
  wishlist    = Wishlist.get();
  const btn   = document.getElementById('detailWishlistBtn');
  if (btn) btn.textContent = added ? '♥ Saved to Wishlist' : '♡ Save to Wishlist';
  showToast(added ? 'Added to wishlist ♥' : 'Removed from wishlist', added ? 'success' : 'info');
  updateWishlistCount();
  const gridBtn = document.querySelector(`.wishlist-toggle[data-id="${itemId}"]`);
  if (gridBtn) { gridBtn.textContent = added ? '♥ Saved' : '♡ Save to Wishlist'; gridBtn.classList.toggle('saved', added); }
}

function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
document.addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open'); });

// ── Scroll / Nav Effects ───────────────────────────────────
function initScrollEffects() {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => navbar?.classList.toggle('scrolled', window.scrollY > 60));
}
function initHeroParallax() {
  const heroPattern = document.querySelector('.hero-pattern');
  if (!heroPattern) return;
  window.addEventListener('scroll', () => { heroPattern.style.transform = `translateY(${window.scrollY * 0.25}px)`; }, { passive: true });
}
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  hamburger?.addEventListener('click', () => {
    const isOpen = mobileNav?.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (spans.length >= 3) {
      spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
      spans[1].style.opacity   = isOpen ? '0' : '1';
      spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
    }
  });
  document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', () => mobileNav?.classList.remove('open')));
}
function scrollToCollection() {
  const section = document.getElementById('productsSection');
  if (section) window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 130, behavior: 'smooth' });
}

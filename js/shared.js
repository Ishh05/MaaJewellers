// ============================================================
//  MAA JEWELLERS — Shared JS Utilities (Full-Stack Version)
//  All product data now comes from the Express/MongoDB backend.
// ============================================================

'use strict';

// ── API Base URL ────────────────────────────────────────────
const API_BASE = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
  ? `http://${window.location.hostname}:5000`
  : window.location.origin;

const API_PRODUCTS = `${API_BASE}/api/products`;
const API_AUTH     = `${API_BASE}/api/auth`;

// ── Categories ──────────────────────────────────────────────
const CATEGORIES = [
  { id: 'new-arrivals',      label: 'New Arrivals',           icon: '✨' },
  { id: 'most-trendy',       label: 'Most Trendy',            icon: '🔥' },
  { id: 'bridal-collection', label: 'Bridal Collection',      icon: '👑' },
  { id: 'traditional',       label: 'Traditional Collection', icon: '🌺' },
  { id: 'daily-wear',        label: 'Daily Wear',             icon: '💫' },
];

// ── Token Helpers (Admin JWT) ───────────────────────────────
const Auth = {
  getToken()   { return sessionStorage.getItem('maaAdminToken'); },
  setToken(t)  { sessionStorage.setItem('maaAdminToken', t); },
  clearToken() { sessionStorage.removeItem('maaAdminToken'); },
  isLoggedIn() { return !!this.getToken(); },
  authHeader() { return { Authorization: `Bearer ${this.getToken()}` }; },
};

// ── Wishlist (localStorage — per-browser) ───────────────────
const Wishlist = {
  KEY: 'maaJewellers_wishlist',
  get()      { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; } },
  set(list)  { localStorage.setItem(this.KEY, JSON.stringify(list)); },
  has(id)    { return this.get().includes(id); },
  toggle(id) {
    const list = this.get();
    const idx  = list.indexOf(id);
    if (idx >= 0) list.splice(idx, 1); else list.push(id);
    this.set(list);
    return idx < 0; // true = added
  },
};

// ── API Client ──────────────────────────────────────────────
const Api = {
  async getProducts(category = '') {
    const url = category ? `${API_PRODUCTS}?category=${encodeURIComponent(category)}` : API_PRODUCTS;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load products');
    const json = await res.json();
    return json.data || [];
  },
  async getProduct(id) {
    const res = await fetch(`${API_PRODUCTS}/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return (await res.json()).data;
  },
  async addProduct(data) {
    const res = await fetch(API_PRODUCTS, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...Auth.authHeader() },
      body:    JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to add product');
    return json.data;
  },
  async updateProduct(id, data) {
    const res = await fetch(`${API_PRODUCTS}/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json', ...Auth.authHeader() },
      body:    JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update product');
    return json.data;
  },
  async deleteProduct(id) {
    const res = await fetch(`${API_PRODUCTS}/${id}`, {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json', ...Auth.authHeader() },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete product');
    return json;
  },
  async login(username, password) {
    const res = await fetch(`${API_AUTH}/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Login failed');
    return json;
  },
  async verifyToken() {
    if (!Auth.isLoggedIn()) return false;
    try {
      const res  = await fetch(`${API_AUTH}/verify`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...Auth.authHeader() },
      });
      return (await res.json()).valid === true;
    } catch { return false; }
  },
};

// ── Category Helpers ────────────────────────────────────────
function getCategoryLabel(id) { return CATEGORIES.find(c => c.id === id)?.label || id; }
function getCategoryIcon(id)  { return CATEGORIES.find(c => c.id === id)?.icon  || '💎'; }

// ── Toast Notifications ─────────────────────────────────────
function showToast(message, type = 'info', duration = 3200) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: '◆' };
  toast.innerHTML = `<span>${icons[type] || '◆'}</span>&nbsp; ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slide-out 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ── Image to Base64 ─────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── HTML Escape ─────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

# 👑 Maa Jewellers — Royal Indian Jewellery Website

A luxury jewellery catalogue website with an elegant Indian royal aesthetic featuring deep maroon and royal gold color palette.

---

## 📁 File Structure

```
MaaJewellers/
├── index.html          ← Customer-facing page
├── admin.html          ← Owner dashboard (login protected)
├── css/
│   ├── style.css       ← Shared base styles (fonts, colors, utilities)
│   ├── customer.css    ← Customer page styles
│   └── admin.css       ← Admin dashboard styles
├── js/
│   ├── shared.js       ← Data storage, utilities, CATEGORIES config
│   ├── customer.js     ← Customer page interactions
│   └── admin.js        ← Admin dashboard logic
└── README.md
```

---

## 🔐 Admin Login Credentials

- **URL:** `yoursite.com/admin.html`
- **Username:** `admin` (or `owner`)
- **Password:** `MaaJewellers@2024`

> ⚠️ **Important:** After deploying, change the password in `js/shared.js` (line: `const ADMIN_PASS = '...'`)

---

## ✨ Features

### Customer View (`index.html`)
- 🏰 Elegant hero banner with parallax and animated elements
- 📦 Browse by category: New Arrivals, Most Trendy, Bridal, Traditional, Daily Wear
- ♥ Save to Wishlist (persists in browser)
- 📋 Item detail view with full description
- 📱 Fully responsive mobile design
- 🎨 Royal maroon & gold theme with Mughal-inspired patterns

### Owner Dashboard (`admin.html`)
- 🔒 Secure login with session management
- ➕ Add jewellery items with image upload (drag & drop supported)
- ✏️ Edit any item's name, category, description, or image
- 🗑️ Delete items with confirmation dialog
- 📊 Stats cards showing item counts per category
- 🔍 Search and filter items
- 📱 Responsive sidebar with mobile toggle

---

## 🌐 Hosting Options

### Option 1: Netlify (Recommended — Free)
1. Go to [netlify.com](https://netlify.com)
2. Sign up / Log in
3. Drag and drop the entire `MaaJewellers` folder onto the Netlify dashboard
4. Your site is live instantly! You get a URL like `random-name.netlify.app`
5. You can set a custom domain in Netlify settings

### Option 2: GitHub Pages (Free)
1. Create a free account at [github.com](https://github.com)
2. Create a new repository called `MaaJewellers`
3. Upload all files to the repository
4. Go to Settings → Pages → Source: `main` branch → `/root`
5. Your site will be at `yourusername.github.io/MaaJewellers`

### Option 3: Vercel (Free)
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository or drag & drop the folder
4. Deploy in one click

### Option 4: Local Hosting (for testing)
- Simply open `index.html` in any web browser
- Note: Some features may need a local server due to browser security
- Install VS Code + Live Server extension for the best experience

---

## 📱 Data Storage

This website uses **browser localStorage** to store:
- All jewellery items (images stored as base64)
- Customer wishlist preferences

> 💡 This means data is stored in the browser — each visitor has their own wishlist. The owner's items are visible to all visitors from the same browser/device where they were added. For a shared database across devices, consider upgrading to Firebase (free tier available).

---

## 🎨 Customization

### Change Shop Name
Search and replace `Maa Jewellers` across all HTML files.

### Change Colors
Edit `css/style.css` root variables:
```css
:root {
  --maroon: #6B0F1A;
  --gold: #C9A84C;
}
```

### Change Password
Edit `js/shared.js`:
```javascript
const ADMIN_PASS = 'YourNewPassword@2024';
```

### Change Contact Info
Edit the footer in `index.html`.

---

## 📞 Support

For customization or technical help, feel free to reach out!

*Crafted with ♥ for Maa Jewellers*

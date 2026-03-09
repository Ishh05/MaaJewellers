// ============================================================
//  MAA JEWELLERS — Products Routes
//
//  GET    /api/products          → public  (customer page)
//  GET    /api/products/:id      → public  (single item)
//  POST   /api/products          → admin only (add item)
//  PUT    /api/products/:id      → admin only (edit item)
//  DELETE /api/products/:id      → admin only (remove item)
// ============================================================

const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// ── GET /api/products ─────────────────────────────────────
// Public — returns all products, optionally filtered by category
// Query params: ?category=bridal-collection
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product
      .find(filter)
      .sort({ createdAt: -1 }); // newest first

    res.json({
      success: true,
      count:   products.length,
      data:    products,
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
});

// ── GET /api/products/:id ─────────────────────────────────
// Public — returns a single product by MongoDB _id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
});

// ── POST /api/products ────────────────────────────────────
// Admin only — add a new jewellery item
// Body: { name, category, description, image, price }
router.post('/', protect, async (req, res) => {
  try {
    const { name, category, description, image, price } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required.',
      });
    }

    const product = await Product.create({
      name:        name.trim(),
      category,
      description: description?.trim() || '',
      image:       image?.trim()       || '',
      price:       price?.trim()       || '',
    });

    res.status(201).json({
      success: true,
      data:    product,
      message: `"${product.name}" added to collection successfully.`,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('POST /api/products error:', error);
    res.status(500).json({ success: false, message: 'Failed to add product.' });
  }
});

// ── PUT /api/products/:id ─────────────────────────────────
// Admin only — edit an existing jewellery item
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, category, description, image, price } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...(name        && { name:        name.trim()        }),
        ...(category    && { category                        }),
        ...(description !== undefined && { description: description.trim() }),
        ...(image       !== undefined && { image:       image.trim()       }),
        ...(price       !== undefined && { price:       price.trim()       }),
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({
      success: true,
      data:    product,
      message: `"${product.name}" updated successfully.`,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// ── DELETE /api/products/:id ──────────────────────────────
// Admin only — remove a jewellery item
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({
      success: true,
      message: `"${product.name}" removed from collection.`,
    });
  } catch (error) {
    console.error('DELETE /api/products error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

module.exports = router;

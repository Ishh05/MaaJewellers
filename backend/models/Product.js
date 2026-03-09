// ============================================================
//  MAA JEWELLERS — Product Model
// ============================================================

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Product name is required'],
      trim:     true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum: {
        values:  ['new-arrivals', 'most-trendy', 'bridal-collection', 'traditional', 'daily-wear'],
        message: '{VALUE} is not a valid category',
      },
    },
    description: {
      type:    String,
      trim:    true,
      default: '',
      maxlength: [600, 'Description cannot exceed 600 characters'],
    },
    image: {
      type:    String,
      trim:    true,
      default: '',
      // Accepts any image URL (https://...) or base64 data URI
    },
    price: {
      type:    String,
      trim:    true,
      default: '',
      // Stored as string so owner can write "₹45,000" or "On Request"
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index for fast category queries
productSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);

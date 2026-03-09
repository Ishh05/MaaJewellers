// ============================================================
//  MAA JEWELLERS — Auth Middleware (JWT Verification)
// ============================================================

const jwt = require('jsonwebtoken');

/**
 * Protect — verifies JWT token from Authorization header.
 * Used on all admin-only routes (POST, DELETE products).
 */
const protect = (req, res, next) => {
  try {
    // Expect: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // attach decoded payload to request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

module.exports = { protect };

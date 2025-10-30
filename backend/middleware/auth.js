const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'game-legends-secret-key-2025';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'غير مصرح - لا يوجد رمز مميز' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'رمز مميز غير صالح' 
    });
  }
};

module.exports = { verifyToken, JWT_SECRET };

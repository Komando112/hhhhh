const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1';

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'يرجى إدخال كلمة المرور' 
      });
    }

    // Check password (in production, this should be hashed)
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ 
        success: false, 
        message: 'كلمة المرور غير صحيحة' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { admin: true, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true, 
      message: 'تم تسجيل الدخول بنجاح',
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ أثناء تسجيل الدخول' 
    });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ success: false });
  }
});

module.exports = router;

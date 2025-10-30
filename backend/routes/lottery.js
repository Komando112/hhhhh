const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const storage = require('../storage');

// Get all active lottery draws
router.get('/', async (req, res) => {
  try {
    const draws = await storage.getLotteryDraws();
    res.json({ success: true, draws });
  } catch (error) {
    console.error('Get lottery error:', error);
    res.status(500).json({ success: false, message: 'فشل في تحميل القرعة' });
  }
});

// Create new lottery draw (protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, names, clubs } = req.body;

    if (!title || !names || !clubs || names.length === 0 || clubs.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'يرجى تقديم عنوان وأسماء وأندية' 
      });
    }

    // Perform draw
    const shuffledClubs = [...clubs].sort(() => Math.random() - 0.5);
    const results = [];
    
    names.forEach((name, index) => {
      const club = shuffledClubs[index % shuffledClubs.length];
      results.push({ name, club });
    });
    
    // Shuffle results
    results.sort(() => Math.random() - 0.5);

    const newDraw = {
      id: Date.now(),
      title: title.trim(),
      results,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    await storage.addLotteryDraw(newDraw);

    res.json({ 
      success: true, 
      message: 'تم إجراء القرعة بنجاح - محفوظة لمدة 24 ساعة', 
      draw: newDraw 
    });
  } catch (error) {
    console.error('Create lottery error:', error);
    res.status(500).json({ success: false, message: 'فشل في إنشاء القرعة' });
  }
});

// Delete lottery draw (protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteLotteryDraw(parseInt(id));

    res.json({ 
      success: true, 
      message: 'تم حذف القرعة بنجاح' 
    });
  } catch (error) {
    console.error('Delete lottery error:', error);
    res.status(500).json({ success: false, message: 'فشل في حذف القرعة' });
  }
});

module.exports = router;

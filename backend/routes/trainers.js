const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const storage = require('../storage');

// Get all trainers (public endpoint)
router.get('/', async (req, res) => {
  try {
    const trainers = await storage.getTrainers();
    res.json({ success: true, trainers });
  } catch (error) {
    console.error('Get trainers error:', error);
    res.status(500).json({ success: false, message: 'فشل في تحميل المدربين' });
  }
});

// Add new trainer (protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, leagues = 0, cups = 0, tournaments = 0 } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'اسم المدرب مطلوب' 
      });
    }

    const trainers = await storage.getTrainers();
    
    // Check for duplicate names
    if (trainers.some(t => t.name === name.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: 'هذا الاسم موجود مسبقاً' 
      });
    }

    const newTrainer = {
      id: trainers.length > 0 ? Math.max(...trainers.map(t => t.id)) + 1 : 1,
      name: name.trim(),
      leagues: parseInt(leagues) || 0,
      cups: parseInt(cups) || 0,
      tournaments: parseInt(tournaments) || 0
    };

    trainers.push(newTrainer);
    await storage.setTrainers(trainers);

    res.json({ 
      success: true, 
      message: 'تم إضافة المدرب بنجاح', 
      trainer: newTrainer 
    });
  } catch (error) {
    console.error('Add trainer error:', error);
    res.status(500).json({ success: false, message: 'فشل في إضافة المدرب' });
  }
});

// Update trainer (protected)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, leagues, cups, tournaments } = req.body;

    const trainers = await storage.getTrainers();
    const index = trainers.findIndex(t => t.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'المدرب غير موجود' 
      });
    }

    // Check for duplicate names (excluding current trainer)
    if (name && trainers.some((t, i) => i !== index && t.name === name.trim())) {
      return res.status(400).json({ 
        success: false, 
        message: 'هذا الاسم موجود مسبقاً' 
      });
    }

    trainers[index] = {
      ...trainers[index],
      ...(name && { name: name.trim() }),
      ...(leagues !== undefined && { leagues: parseInt(leagues) || 0 }),
      ...(cups !== undefined && { cups: parseInt(cups) || 0 }),
      ...(tournaments !== undefined && { tournaments: parseInt(tournaments) || 0 })
    };

    await storage.setTrainers(trainers);

    res.json({ 
      success: true, 
      message: 'تم تحديث المدرب بنجاح', 
      trainer: trainers[index] 
    });
  } catch (error) {
    console.error('Update trainer error:', error);
    res.status(500).json({ success: false, message: 'فشل في تحديث المدرب' });
  }
});

// Delete trainer (protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const trainers = await storage.getTrainers();
    const index = trainers.findIndex(t => t.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'المدرب غير موجود' 
      });
    }

    trainers.splice(index, 1);
    await storage.setTrainers(trainers);

    res.json({ 
      success: true, 
      message: 'تم حذف المدرب بنجاح' 
    });
  } catch (error) {
    console.error('Delete trainer error:', error);
    res.status(500).json({ success: false, message: 'فشل في حذف المدرب' });
  }
});

module.exports = router;

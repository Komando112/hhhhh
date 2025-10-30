// Dual Storage System - Works on both Replit (files) and Vercel (KV)

const fs = require('fs').promises;
const path = require('path');

// Try to import Vercel KV (won't work on Replit, that's ok)
let kv = null;
try {
  const vercelKV = require('@vercel/kv');
  kv = vercelKV.kv;
} catch (e) {
  console.log('ℹ️ Vercel KV not available, using file storage');
}

const DATA_DIR = path.join(__dirname, 'data');
const USE_KV = process.env.NODE_ENV === 'production' && kv !== null;

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Storage Interface
class Storage {
  async getTrainers() {
    if (USE_KV) {
      const trainers = await kv.get('trainers');
      return trainers || this.getDefaultTrainers();
    } else {
      await ensureDataDir();
      const filePath = path.join(DATA_DIR, 'trainers.json');
      try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
      } catch {
        const defaultTrainers = this.getDefaultTrainers();
        await fs.writeFile(filePath, JSON.stringify(defaultTrainers, null, 2));
        return defaultTrainers;
      }
    }
  }

  async setTrainers(trainers) {
    if (USE_KV) {
      await kv.set('trainers', trainers);
    } else {
      await ensureDataDir();
      const filePath = path.join(DATA_DIR, 'trainers.json');
      await fs.writeFile(filePath, JSON.stringify(trainers, null, 2));
    }
  }

  async getLotteryDraws() {
    if (USE_KV) {
      const keys = await kv.keys('lottery:*');
      const draws = [];
      for (const key of keys) {
        const draw = await kv.get(key);
        if (draw) draws.push(draw);
      }
      // Filter expired draws
      const now = new Date();
      return draws.filter(draw => new Date(draw.expiresAt) > now);
    } else {
      await ensureDataDir();
      const filePath = path.join(DATA_DIR, 'lottery.json');
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const lottery = JSON.parse(data);
        // Filter expired draws
        const now = new Date();
        lottery.draws = lottery.draws.filter(draw => new Date(draw.expiresAt) > now);
        await fs.writeFile(filePath, JSON.stringify(lottery, null, 2));
        return lottery.draws;
      } catch {
        await fs.writeFile(filePath, JSON.stringify({ draws: [] }, null, 2));
        return [];
      }
    }
  }

  async addLotteryDraw(draw) {
    if (USE_KV) {
      // Store with 24-hour expiry
      await kv.set(`lottery:${draw.id}`, draw, { ex: 86400 }); // 24 hours in seconds
    } else {
      await ensureDataDir();
      const filePath = path.join(DATA_DIR, 'lottery.json');
      let lottery = { draws: [] };
      try {
        const data = await fs.readFile(filePath, 'utf8');
        lottery = JSON.parse(data);
      } catch {
        // File doesn't exist, use default
      }
      lottery.draws.push(draw);
      await fs.writeFile(filePath, JSON.stringify(lottery, null, 2));
    }
  }

  async deleteLotteryDraw(drawId) {
    if (USE_KV) {
      await kv.del(`lottery:${drawId}`);
    } else {
      await ensureDataDir();
      const filePath = path.join(DATA_DIR, 'lottery.json');
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const lottery = JSON.parse(data);
        lottery.draws = lottery.draws.filter(d => d.id !== drawId);
        await fs.writeFile(filePath, JSON.stringify(lottery, null, 2));
      } catch {
        // File doesn't exist, nothing to delete
      }
    }
  }

  getDefaultTrainers() {
    return [
      { id: 1, name: "عـبـدالله الاسـعـد", leagues: 13, cups: 9, tournaments: 8 },
      { id: 2, name: "أبـو فـࢪيـده", leagues: 9, cups: 7, tournaments: 8 },
      { id: 3, name: "عـمـࢪ حـسـن", leagues: 7, cups: 6, tournaments: 5 },
      { id: 4, name: "أبـو حـنـيـن", leagues: 4, cups: 7, tournaments: 6 },
      { id: 5, name: "اسـامـه", leagues: 2, cups: 2, tournaments: 5 },
      { id: 6, name: "مـحـمـود الاسـعـد", leagues: 3, cups: 1, tournaments: 5 },
      { id: 7, name: "أحـمـد مـودي", leagues: 0, cups: 2, tournaments: 5 },
      { id: 8, name: "مـحـمـد سـلـيـمـان", leagues: 2, cups: 3, tournaments: 2 },
      { id: 9, name: "آمـيـن الـعـتـࢪبـي", leagues: 1, cups: 0, tournaments: 3 },
      { id: 10, name: "عـبـدالـࢪحـمـن بـوده", leagues: 0, cups: 0, tournaments: 2 }
    ];
  }
}

module.exports = new Storage();

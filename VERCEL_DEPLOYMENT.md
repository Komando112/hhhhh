# 🚀 Vercel Deployment Guide - Game Legends

## ⚠️ Important: Storage Configuration Required

The current implementation uses file-based storage which **will not persist on Vercel**. You have two options:

---

## Option 1: Vercel KV (Recommended for Production)

### Step 1: Install Vercel KV Package

```bash
npm install @vercel/kv
```

### Step 2: Create Vercel KV Database

1. Go to your Vercel Dashboard
2. Navigate to **Storage** → **Create Database** → **KV**
3. Name it: `game-legends-kv`
4. Click **Create**
5. Connect it to your project

Vercel will automatically add these environment variables:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### Step 3: Update Backend to Use Vercel KV

Replace file-based storage in:
- `backend/routes/trainers.js`
- `backend/routes/lottery.js`

**Example for trainers.js:**

```javascript
const { kv } = require('@vercel/kv');

// Read trainers
async function readTrainers() {
  const trainers = await kv.get('trainers');
  if (!trainers) {
    // Return initial data
    const initial = [/* initial trainers */];
    await kv.set('trainers', initial);
    return initial;
  }
  return trainers;
}

// Write trainers
async function writeTrainers(trainers) {
  await kv.set('trainers', trainers);
}
```

**Example for lottery.js (with 24-hour expiry):**

```javascript
const { kv } = require('@vercel/kv');

// Save lottery with 24-hour TTL
async function saveLottery(drawId, drawData) {
  await kv.set(`lottery:${drawId}`, drawData, { ex: 86400 }); // 24 hours
}

// Get all active lotteries
async function getActiveLotteries() {
  const keys = await kv.keys('lottery:*');
  const draws = [];
  for (const key of keys) {
    const draw = await kv.get(key);
    if (draw) draws.push(draw);
  }
  return draws;
}
```

---

## Option 2: File-Based (Development Only)

**Note**: This works perfectly on Replit but **data will be lost on Vercel** between deployments.

For local development and Replit, the current file-based system works great!

---

## Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No (first time) or Yes (updates)
- **What's your project's name?** game-legends
- **In which directory is your code located?** ./

### 4. Configure Environment Variables

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these variables:

```
ADMIN_PASSWORD=your-strong-password-here
JWT_SECRET=your-very-long-random-secret-key-here
NODE_ENV=production
```

**Important**: 
- Use a **strong password** for ADMIN_PASSWORD
- Generate a **random string** for JWT_SECRET (at least 32 characters)
- Never use the default password `1` in production!

### 5. Production Deployment

```bash
vercel --prod
```

Your site will be live at: `https://your-project-name.vercel.app`

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| ADMIN_PASSWORD | ✅ Yes | Control panel password | `MySecurePass123!` |
| JWT_SECRET | ✅ Yes | Token encryption key | `a1b2c3d4e5f6g7h8...` |
| NODE_ENV | ✅ Yes | Environment mode | `production` |
| KV_URL* | Only with KV | Vercel KV URL | Auto-added by Vercel |
| KV_REST_API_URL* | Only with KV | KV REST API URL | Auto-added by Vercel |
| KV_REST_API_TOKEN* | Only with KV | KV API Token | Auto-added by Vercel |

*Auto-added when you create Vercel KV database

---

## Testing Your Deployment

### 1. Test Homepage
```
https://your-app.vercel.app/
```

### 2. Test Control Panel
```
https://your-app.vercel.app/control-panel.html
```
- Login with your ADMIN_PASSWORD
- Try adding a trainer
- Verify data persists after page reload

### 3. Test Lottery System
```
https://your-app.vercel.app/draw-new.html
```
- Add names and clubs
- Create a lottery (requires password)
- Verify it's saved and accessible for 24 hours

---

## Troubleshooting

### Problem: Pages show 404 errors
**Solution**: Make sure vercel.json is properly configured

### Problem: API returns 500 errors
**Solution**: 
1. Check Vercel Dashboard → Logs
2. Verify environment variables are set
3. Ensure storage (KV) is configured

### Problem: Data doesn't persist
**Solution**: 
- File-based storage won't work on Vercel
- Must use Vercel KV (see Option 1 above)

### Problem: Password doesn't work
**Solution**:
1. Check ADMIN_PASSWORD in environment variables
2. Make sure it matches what you're entering
3. Try redeploying after changing variables

---

## Cost Information

### Free Tier Includes:
- ✅ Unlimited static sites
- ✅ 100 GB bandwidth/month
- ✅ Serverless function executions
- ✅ Basic Vercel KV (256 MB storage, 100K requests/day)

### If You Need More:
- **Pro Plan**: $20/month per member
- More storage, bandwidth, and team features

---

## Security Best Practices

1. ✅ **Never commit .env files** (already in .gitignore)
2. ✅ **Use strong passwords** (not the default `1`)
3. ✅ **Change JWT_SECRET** to a random 64-character string
4. ✅ **Enable Vercel's HTTPS** (automatic)
5. ✅ **Monitor your logs** for suspicious activity

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Vercel KV Docs**: https://vercel.com/docs/storage/vercel-kv
- **Support**: Contact through Vercel Dashboard

---

## Quick Commands Cheat Sheet

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Preview deployment
vercel

# Production deployment
vercel --prod

# Check deployment logs
vercel logs

# Pull environment variables
vercel env pull

# List deployments
vercel ls
```

---

## Current Status

✅ **Works on Replit**: Fully functional with file-based storage
⚠️ **Vercel Requires**: Vercel KV setup for data persistence
📝 **To Do**: Follow Option 1 above to enable Vercel KV

---

Good luck with your deployment! 🎉

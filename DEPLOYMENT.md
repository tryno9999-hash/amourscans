# AmourScans - Deployment Guide (Portable Version)

This is the **portable version** of AmourScans that works on any Node.js hosting platform. All Replit-specific dependencies have been removed.

## Table of Contents

- [Quick Start](#quick-start)
- [Recommended Hosting Platforms](#recommended-hosting-platforms)
- [Environment Variables](#environment-variables)
- [Deployment Instructions](#deployment-instructions)
- [Post-Deployment Setup](#post-deployment-setup)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

**Requirements:**
- Node.js 18+ (or 20+)
- npm or yarn
- 500MB+ disk space (for dependencies + uploads)

**Local Development:**
```bash
# Install dependencies
npm install

# Create database
npm run db:init

# Start development server
npm run dev
```

Visit `http://localhost:5000`

---

## Recommended Hosting Platforms

### ✅ Best Options (Free Tier Available)

#### 1. **Render** ⭐ Recommended
**Why:** Full Node.js support, persistent disk, auto-deploy from Git

**Pros:**
- Native SQLite support
- Automatic SSL certificates
- Built-in continuous deployment
- PostgreSQL available if needed

**Free Tier:**
- 750 hours/month runtime
- 512MB RAM
- Sleeps after 15min inactivity

**Deploy:** https://render.com

---

#### 2. **Railway**
**Why:** Simple setup, database support included

**Pros:**
- Fast deployment
- Built-in PostgreSQL/Redis
- Great for monorepo apps
- WebSocket support

**Free Tier:**
- $5/month free credits
- Pay-as-you-go after

**Deploy:** https://railway.app

---

#### 3. **Fly.io**
**Why:** Global edge deployment, Docker support

**Pros:**
- Multiple regions worldwide
- Full Node.js + SQLite support
- WebSocket support
- Great for distributed apps

**Free Tier:**
- ~$15/month worth of resources
- 3 shared-CPU VMs

**Deploy:** https://fly.io

---

### ⚠️ NOT Recommended

**Vercel/Netlify** - Designed for serverless functions, not full Express.js servers. Requires significant code changes.

**Heroku** - No longer has a free tier.

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

### Required
```env
NODE_ENV=production
APP_URL=https://yourapp.onrender.com  # Your deployed URL
```

### Optional
```env
# OAuth (if using social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

# Email (if enabling notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourapp.com

# Payments (if using Stripe)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS (if using custom domain)
ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com
```

---

## Deployment Instructions

### Option 1: Deploy to Render

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - portable version"
   git remote add origin https://github.com/yourusername/yourrepo.git
   git push -u origin main
   ```

2. **Create Render account:**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this code

4. **Configure Build Settings:**
   ```
   Name: amourscans (or your preferred name)
   Region: Choose closest to your users
   Branch: main
   Root Directory: . (leave blank)
   
   Build Command:
   npm install && npm run db:init && npm run build
   
   Start Command:
   npm start
   ```

5. **Environment Variables:**
   - Click "Environment" tab
   - Add:
     ```
     NODE_ENV = production
     APP_URL = https://yourapp.onrender.com
     ```
   - Add any optional variables from `.env.example`

6. **Create Service:**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Your app will be live at `https://yourapp-name.onrender.com`

---

### Option 2: Deploy to Railway

1. **Push code to GitHub** (same as Render step 1)

2. **Create Railway account:**
   - Go to https://railway.app
   - Sign up with GitHub

3. **Deploy:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js and deploys

4. **Configure:**
   - Click "Variables" tab
   - Add environment variables from `.env.example`
   - Set `APP_URL` to your Railway URL

5. **Domain:**
   - Click "Settings" → "Generate Domain"
   - Your app is now live!

---

### Option 3: Deploy to Fly.io

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Initialize:**
   ```bash
   fly launch
   ```
   
   Follow prompts:
   - Choose app name
   - Select region
   - Don't add database (we use SQLite)
   - Deploy now? Yes

4. **Set environment variables:**
   ```bash
   fly secrets set NODE_ENV=production
   fly secrets set APP_URL=https://yourapp.fly.dev
   ```

5. **Deploy:**
   ```bash
   fly deploy
   ```

---

## Post-Deployment Setup

### 1. Create Admin Account

After first deployment, create an admin user:

**Option A: Using the admin script**
```bash
# SSH into your server (Render/Railway/Fly provide SSH)
npm run admin:create
```

**Option B: Via database**
The app auto-creates an admin account on first run with:
- Username: `admin`
- Password: Check server logs for auto-generated password
- You can change this immediately after first login

### 2. Configure OAuth (Optional)

#### Google OAuth:
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   ```
   https://yourapp.onrender.com/api/auth/google/callback
   ```
6. Copy Client ID and Secret to environment variables

#### Discord OAuth:
1. Go to https://discord.com/developers/applications
2. Create new application
3. Add redirect URL:
   ```
   https://yourapp.onrender.com/api/auth/discord/callback
   ```
4. Copy Client ID and Secret to environment variables

### 3. Enable Email Notifications (Optional)

**Gmail SMTP (easiest):**
1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" at https://myaccount.google.com/apppasswords
3. Set environment variables:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=noreply@yoursite.com
   ```

**SendGrid (production):**
1. Sign up at https://sendgrid.com
2. Create API key
3. Follow their Node.js setup guide
4. Update `server/utils/email.ts` with SendGrid SDK

### 4. Configure Stripe (Optional)

1. Sign up at https://stripe.com
2. Get API keys from Dashboard
3. Set environment variables:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Configure webhook endpoint:
   ```
   https://yourapp.onrender.com/api/webhooks/stripe
   ```

---

## Troubleshooting

### Issue: "Module not found: @replit/..."

**Cause:** You're using the original version, not the portable version

**Fix:** Make sure you're deploying from the `portable-version/` directory

---

### Issue: Database not persisting

**Cause:** Free hosting platforms may have ephemeral disk storage

**Fix:** 
- **Render:** Use persistent disk (available on paid plans)
- **Railway:** Databases persist automatically
- **Fly.io:** Use volumes for persistence

---

### Issue: 502 Bad Gateway

**Cause:** Server not binding to correct port or host

**Fix:** The app automatically binds to `0.0.0.0:5000`. Ensure your platform allows port 5000, or update `vite.config.ts` and `server/index.ts` to use `process.env.PORT`

---

### Issue: OAuth callback fails

**Cause:** Incorrect redirect URI

**Fix:** 
1. Check `APP_URL` environment variable matches your deployed URL
2. Update OAuth provider settings with correct callback URL
3. Ensure no trailing slash in `APP_URL`

---

### Issue: Uploads not working

**Cause:** Write permissions or storage limits

**Fix:**
1. Ensure `public/uploads/` directory exists
2. Check hosting platform disk limits
3. For Render, consider using persistent disk
4. Alternatively, migrate to cloud storage (AWS S3, Cloudflare R2)

---

### Issue: Email not sending

**Cause:** Email is disabled by default

**Fix:** Follow the instructions in `server/utils/email.ts` to set up SMTP or an email service provider

---

## Performance Tips

1. **Enable compression** (already configured in production)
2. **Use CDN** for static assets if traffic grows
3. **Optimize images** before uploading (app has built-in optimization)
4. **Consider upgrading** to paid tier for:
   - Always-on (no sleep)
   - More RAM/CPU
   - Persistent storage
   - Better performance

---

## Security Checklist

✅ Set `NODE_ENV=production` in environment variables
✅ Use strong passwords for admin account
✅ Keep Stripe keys in environment variables (never commit to Git)
✅ Enable HTTPS (automatic on Render/Railway/Fly)
✅ Set CORS `ALLOWED_ORIGINS` for production domains
✅ Regularly backup your SQLite database
✅ Monitor for security updates: `npm audit`

---

## Need Help?

- **Platform Issues:** Contact your hosting provider's support
- **Code Issues:** Check the original `replit.md` for architecture details
- **OAuth Setup:** See official provider documentation
- **Email Setup:** Check `server/utils/email.ts` for detailed instructions

---

## What's Different from Replit Version?

See `PORTABILITY_CHANGES.md` for a complete list of modifications made to make this version portable.

**Key changes:**
- Removed `@replit/object-storage` → Local file system storage
- Removed Replit Vite plugins
- Replaced `REPLIT_DEV_DOMAIN` → `APP_URL`
- Disabled Replit Mail → Standard SMTP setup instructions

Your app retains all features:
- ✅ User authentication
- ✅ Admin panel
- ✅ Content management
- ✅ Payment processing
- ✅ Real-time updates (WebSockets)
- ✅ SQLite database
- ✅ Image uploads (local storage)

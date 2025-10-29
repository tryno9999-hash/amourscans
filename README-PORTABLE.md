# AmourScans - Portable Version

**This is the portable, platform-independent version of AmourScans.**

✅ Works on: Render, Railway, Fly.io, and any Node.js hosting platform  
❌ No longer requires: Replit-specific services or environment

---

## 🚀 Quick Start

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Initialize database
npm run db:init

# 3. Start development server
npm run dev
```

Visit: `http://localhost:5000`

---

## 📦 What's Different?

This version has been **completely freed from Replit dependencies**:

### ✅ What Changed
- **Image Storage**: Replit Object Storage → Local file system (`public/uploads/`)
- **Email Service**: Replit Mail → Standard SMTP (configurable)
- **Environment Variables**: `REPLIT_*` → Generic variables (`APP_URL`, `ALLOWED_ORIGINS`)
- **Build Tools**: Removed Replit Vite plugins

### ✅ What Stayed
- All features work exactly the same
- SQLite database (portable file)
- Authentication system
- Admin panel
- Payment processing (Stripe)
- WebSocket real-time updates

---

## 📖 Documentation

**Start Here:**
1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - How to deploy (Render, Railway, Fly.io)
2. **[.env.example](./.env.example)** - Environment variables to configure
3. **[PORTABILITY_CHANGES.md](./PORTABILITY_CHANGES.md)** - Complete list of changes made

**Original Documentation:**
- [replit.md](./replit.md) - Full application architecture and features
- [README.md](./README.md) - Original README

---

## 🌐 Deployment

### Recommended Platforms

**1. Render (Easiest)** ⭐
```bash
# Push to GitHub, then:
# 1. Go to render.com
# 2. New Web Service
# 3. Connect your repo
# 4. Build: npm install && npm run db:init && npm run build
# 5. Start: npm start
```

**2. Railway**
```bash
# Push to GitHub, then:
# Railway auto-detects and deploys
# Just set environment variables
```

**3. Fly.io**
```bash
fly launch
fly secrets set NODE_ENV=production
fly secrets set APP_URL=https://yourapp.fly.dev
fly deploy
```

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for detailed instructions.

---

## ⚙️ Configuration

### Required Environment Variables
```env
NODE_ENV=production
APP_URL=https://yourapp.onrender.com
```

### Optional (for full features)
```env
# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Payments
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

Copy `.env.example` to `.env` for local development.

---

## 📁 File Structure Changes

### New Files
- `.env.example` - Environment variable template
- `DEPLOYMENT.md` - Deployment guide
- `PORTABILITY_CHANGES.md` - Change documentation
- `README-PORTABLE.md` - This file

### Modified Files
- `server/storage/app-storage.ts` - Local file storage
- `server/utils/email.ts` - SMTP instructions
- `package.json` - Removed Replit dependencies
- `vite.config.ts` - Removed Replit plugins
- `server/oauth.ts` - Generic environment variables
- `server/routes.ts` - Generic CORS configuration
- `server/index.ts` - Simplified CSP

### New Directories
- `public/uploads/` - Where uploaded images are stored

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Build
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:init          # Initialize database (first time)
npm run db:backup        # Backup database
npm run db:restore       # Restore from backup

# Admin
npm run admin:create     # Create additional admin user

# Testing
npm test                 # Run tests
npm run check            # TypeScript type checking
```

---

## 📤 Uploads & Storage

**Location:** `./public/uploads/`

```
public/
  uploads/
    covers/       # Series cover images
    chapters/     # Chapter page images
```

**Important:**
- Make sure your hosting platform supports persistent disk storage
- For production, consider migrating to cloud storage (AWS S3, Cloudflare R2)
- Regular backups recommended

---

## 📧 Email Setup

Email is **disabled by default**. To enable:

1. Edit `server/utils/email.ts`
2. Follow the instructions to set up SMTP or a service like SendGrid
3. Set environment variables:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@yoursite.com
   ```

See detailed instructions in `server/utils/email.ts`

---

## 🔐 Security

Built-in security features:
- ✅ CSRF protection
- ✅ Rate limiting (6-tier system)
- ✅ Helmet security headers
- ✅ Password hashing (bcrypt)
- ✅ SQLite session storage
- ✅ Account enumeration protection

**Production Checklist:**
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (automatic on Render/Railway/Fly)
- [ ] Set strong admin password
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Keep dependencies updated (`npm audit`)

---

## 🐛 Troubleshooting

### "Module not found: @replit/..."
**Solution:** Make sure you're using the `portable-version/` directory, not the original.

### Uploads not persisting
**Solution:** Check if your hosting platform has persistent disk storage. Render requires paid plan for persistent disk.

### OAuth callback fails
**Solution:** 
1. Verify `APP_URL` matches your deployed URL
2. Update OAuth provider settings with correct callback URL
3. No trailing slash in `APP_URL`

### Email not sending
**Solution:** Email is disabled by default. See `server/utils/email.ts` for SMTP setup instructions.

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for more troubleshooting.

---

## 🆘 Support

**Questions about deployment?**
- See [DEPLOYMENT.md](./DEPLOYMENT.md)
- Check your hosting platform's documentation

**Questions about features?**
- See [replit.md](./replit.md) for architecture
- Check [README.md](./README.md) for original documentation

**Questions about changes?**
- See [PORTABILITY_CHANGES.md](./PORTABILITY_CHANGES.md)

---

## 📊 Comparison: Original vs Portable

| Feature | Original (Replit) | Portable Version |
|---------|------------------|------------------|
| Hosting | Replit only | Any Node.js host |
| Image Storage | Replit Object Storage | Local file system |
| Email | Replit Mail | SMTP (configurable) |
| Environment | `REPLIT_*` vars | Generic `APP_URL`, etc |
| Dependencies | Replit packages | Standard npm only |
| Deployment | Replit button | Git + hosting platform |

---

## ✨ All Features Still Work

- ✅ User authentication (username/password, OAuth)
- ✅ Admin panel
- ✅ Content management (manga/manhwa)
- ✅ Chapter reader
- ✅ Image uploads
- ✅ Comments & ratings
- ✅ Reading lists & history
- ✅ VIP subscriptions
- ✅ Coin economy
- ✅ Stripe payments
- ✅ Real-time updates (WebSockets)
- ✅ SEO optimization
- ✅ Mobile responsive
- ✅ Offline-first design

**Everything works the same, just portable!** 🎉

---

**Version:** Portable 1.0  
**Created:** October 29, 2025  
**Compatible With:** Node.js 18+, Any standard hosting platform

# Portability Changes Documentation

This document lists **every modification** made to convert the Replit-specific version of AmourScans into a portable version that works on any Node.js hosting platform.

**Date Created:** October 29, 2025  
**Purpose:** Enable deployment to Render, Railway, Fly.io, and other standard Node.js hosts

---

## Table of Contents

1. [Summary of Changes](#summary-of-changes)
2. [File-by-File Changes](#file-by-file-changes)
3. [Removed Dependencies](#removed-dependencies)
4. [New Configuration Files](#new-configuration-files)
5. [Behavioral Changes](#behavioral-changes)
6. [Testing Checklist](#testing-checklist)

---

## Summary of Changes

### What Was Removed
- ❌ **@replit/object-storage** - Replit's proprietary cloud storage
- ❌ **@replit/vite-plugin-cartographer** - Replit development tool
- ❌ **@replit/vite-plugin-runtime-error-modal** - Replit development tool
- ❌ **Replit Mail** integration (replitmail.ts functionality)
- ❌ References to `REPLIT_DEV_DOMAIN` environment variable
- ❌ References to `REPL_SLUG` environment variable
- ❌ References to `REPLIT_DOMAINS` environment variable
- ❌ References to `REPL_IDENTITY` and `WEB_REPL_RENEWAL` auth tokens

### What Was Added
- ✅ **Local file system storage** for uploads (`public/uploads/`)
- ✅ **Generic environment variables** (`APP_URL`, `ALLOWED_ORIGINS`)
- ✅ **SMTP setup instructions** in `server/utils/email.ts`
- ✅ **Comprehensive deployment documentation** (`DEPLOYMENT.md`)
- ✅ **Environment variable template** (`.env.example`)
- ✅ **This change log** (`PORTABILITY_CHANGES.md`)

---

## File-by-File Changes

### 1. `package.json`

**Changes:**
- Removed dependency: `"@replit/object-storage": "^1.0.0"`
- Removed dev dependency: `"@replit/vite-plugin-cartographer": "^0.4.1"`
- Removed dev dependency: `"@replit/vite-plugin-runtime-error-modal": "^0.0.3"`

**Impact:** Eliminates Replit-specific packages

**Before:**
```json
{
  "dependencies": {
    "@replit/object-storage": "^1.0.0",
    ...
  },
  "devDependencies": {
    "@replit/vite-plugin-cartographer": "^0.4.1",
    "@replit/vite-plugin-runtime-error-modal": "^0.0.3",
    ...
  }
}
```

**After:**
```json
{
  "dependencies": {
    // @replit/object-storage removed
    ...
  },
  "devDependencies": {
    // Replit plugins removed
    ...
  }
}
```

---

### 2. `server/storage/app-storage.ts`

**Changes:**
- **Completely rewritten** to use Node.js `fs` module instead of Replit Object Storage
- Storage location changed from cloud → `./public/uploads/`
- Auto-creates directories on initialization
- Maintains same API interface (no changes needed in calling code)

**Impact:** Image uploads now save to local disk instead of Replit cloud storage

**Before:**
```typescript
import { Client } from '@replit/object-storage';

const bucketName = process.env.REPL_SLUG || 'mangaverse';
const client = new Client({ bucketId: bucketName });

export async function uploadImage(buffer: Buffer, filename: string, folder: 'covers' | 'chapters') {
  await client.uploadFromBytes(`${folder}/${filename}`, buffer);
  return `${folder}/${filename}`;
}
```

**After:**
```typescript
import { promises as fs, createReadStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const UPLOADS_BASE_DIR = './public/uploads';

export async function uploadImage(buffer: Buffer, filename: string, folder: 'covers' | 'chapters') {
  const filePath = join(UPLOADS_BASE_DIR, folder, filename);
  await fs.writeFile(filePath, buffer);
  return `${folder}/${filename}`;
}
```

---

### 3. `vite.config.ts`

**Changes:**
- Removed import: `import { cartographer } from "@replit/vite-plugin-cartographer"`
- Removed import: `import errorModal from "@replit/vite-plugin-runtime-error-modal"`
- Removed: `isReplit` and `replitDomain` variables
- Removed plugins: `cartographer()` and `errorModal()` from plugins array

**Impact:** Uses standard Vite configuration

**Before:**
```typescript
import { cartographer } from "@replit/vite-plugin-cartographer";
import errorModal from "@replit/vite-plugin-runtime-error-modal";

const isReplit = !!process.env.REPLIT_DEV_DOMAIN;
const replitDomain = process.env.REPLIT_DEV_DOMAIN || 'localhost';

export default defineConfig({
  plugins: [react(), cartographer(), errorModal()],
  ...
});
```

**After:**
```typescript
export default defineConfig({
  plugins: [react()],
  ...
});
```

---

### 4. `server/oauth.ts`

**Changes:**
- Replaced `REPLIT_DEV_DOMAIN` with `APP_URL` environment variable
- Simplified callback URL logic
- Added documentation comments

**Impact:** OAuth works with any deployment URL

**Before:**
```typescript
const callbackURL = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : 'http://localhost:5000';
```

**After:**
```typescript
// Use APP_URL environment variable for OAuth callbacks
// In production, set this to your deployed URL (e.g., https://yourapp.onrender.com)
// In development, defaults to localhost
const callbackURL = process.env.APP_URL || 'http://localhost:5000';
```

---

### 5. `server/routes.ts`

**Changes Made:**

#### CORS Configuration (Lines 213-237)
- Replaced `REPLIT_DOMAINS` with `ALLOWED_ORIGINS`
- Replaced `REPLIT_DEV_DOMAIN` with `APP_URL`
- Updated whitelist logic

**Before:**
```typescript
const replitDomains = process.env.REPLIT_DOMAINS 
  ? process.env.REPLIT_DOMAINS.split(',').map(d => `https://${d.trim()}`)
  : [];

const corsOriginWhitelist = [
  ...replitDomains,
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
  ...
].filter((origin): origin is string => Boolean(origin));
```

**After:**
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(d => d.trim())
  : [];

const corsOriginWhitelist = [
  ...allowedOrigins,
  process.env.APP_URL ? process.env.APP_URL : null,
  ...
].filter((origin): origin is string => Boolean(origin));
```

#### DMCA Email Notification (Lines 1130-1144)
- Replaced `REPLIT_DOMAINS` with `APP_URL` in email template

**Before:**
```typescript
const adminUrl = process.env.REPLIT_DOMAINS 
  ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/admin` 
  : 'http://localhost:5000/admin';
```

**After:**
```typescript
const adminUrl = process.env.APP_URL || 'http://localhost:5000';
// Used as: ${adminUrl}/admin
```

---

### 6. `server/index.ts`

**Changes:**
- Removed `REPLIT_DEV_DOMAIN` from Content Security Policy (CSP)
- Simplified `imgSrc` and `connectSrc` directives

**Impact:** CSP works on any hosting platform

**Before:**
```typescript
imgSrc: ["'self'", "data:", "https:", "blob:", process.env.REPLIT_DEV_DOMAIN].filter((x): x is string => Boolean(x)),
connectSrc: [
  "'self'", 
  "ws:", 
  "wss:", 
  process.env.REPLIT_DEV_DOMAIN,
  ...(isDevelopment && process.env.REPLIT_DEV_DOMAIN ? [`wss://${process.env.REPLIT_DEV_DOMAIN}`] : [])
].filter((x): x is string => Boolean(x)),
```

**After:**
```typescript
imgSrc: ["'self'", "data:", "https:", "blob:"],
connectSrc: [
  "'self'", 
  "ws:", 
  "wss:", 
  "https://fonts.googleapis.com", 
  "https://fonts.gstatic.com", 
  "https://*.stripe.com"
],
```

---

### 7. `server/utils/email.ts`

**Changes:**
- Removed import of `sendReplitEmail` from `./replitmail`
- Replaced with placeholder implementation + setup instructions
- Added comprehensive documentation for SMTP setup
- Logs emails to console instead of sending (until SMTP is configured)

**Impact:** Email disabled by default; requires manual SMTP setup

**Before:**
```typescript
import { sendEmail as sendReplitEmail } from "./replitmail";

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const result = await sendReplitEmail({
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
  return true;
}
```

**After:**
```typescript
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  console.log(`[email] 📧 EMAIL DISABLED - Would send to: ${options.to}`);
  console.log(`[email] ℹ️  To enable emails, see server/utils/email.ts for setup instructions`);
  
  // TODO: Replace with actual SMTP implementation
  // See documentation in this file for setup examples
  
  return true;
}
```

**Added:** Extensive documentation comments explaining:
- How to set up nodemailer with SMTP
- Environment variables needed
- Example implementation code

---

### 8. `server/utils/replitmail.ts`

**Changes:**
- Added deprecation warning at top of file
- Marked as "not used in portable version"
- File kept for reference but not imported

**Impact:** No functional changes; file not used

**Added Header:**
```typescript
/**
 * DEPRECATED: Replit Mail integration - Not used in portable version
 * 
 * This file contains Replit-specific email functionality that relies on
 * Replit environment variables (REPL_IDENTITY, WEB_REPL_RENEWAL) and
 * Replit's email API.
 * 
 * For the portable version, please use server/utils/email.ts instead,
 * which has instructions for setting up standard SMTP or third-party
 * email services.
 * 
 * This file is kept for reference but should not be imported.
 */
```

---

### 9. `.gitignore`

**Changes:**
- Added `public/uploads/` to ignore list (where uploaded images are stored)
- Added exception for `.gitkeep` to preserve directory structure

**Impact:** Prevents uploaded files from being committed to Git

**Added Lines:**
```gitignore
# Uploaded files (portable version uses public/uploads)
public/uploads/
!public/uploads/.gitkeep
```

---

## New Configuration Files

### 1. `.env.example`

**Purpose:** Template for environment variables

**Contents:**
- `NODE_ENV` - Production/development mode
- `APP_URL` - Deployed application URL
- `ALLOWED_ORIGINS` - CORS whitelist
- `SMTP_*` - Email configuration (optional)
- `STRIPE_*` - Payment configuration (optional)
- `GOOGLE_*` / `DISCORD_*` - OAuth configuration (optional)

**Usage:** Copy to `.env` and fill in values

---

### 2. `DEPLOYMENT.md`

**Purpose:** Comprehensive deployment guide

**Contents:**
- Platform recommendations (Render, Railway, Fly.io)
- Step-by-step deployment instructions
- Environment variable setup
- Post-deployment configuration
- Troubleshooting guide
- Security checklist

---

### 3. `PORTABILITY_CHANGES.md`

**Purpose:** This document

**Contents:**
- Complete change log
- Before/after comparisons
- Impact analysis
- Testing checklist

---

## Behavioral Changes

### Image Upload Behavior

**Before (Replit):**
- Images uploaded to Replit Object Storage (cloud)
- Accessible via Replit's CDN
- No disk space used on server
- Automatic backup/replication

**After (Portable):**
- Images saved to `./public/uploads/` directory
- Served as static files by Express
- Uses server disk space
- Manual backup recommended

**Migration Note:** If migrating from Replit, you'll need to download existing images from Replit Object Storage and place them in `./public/uploads/`

---

### Email Functionality

**Before (Replit):**
- Emails sent via Replit Mail API
- Automatic authentication
- No configuration needed
- Limited to Replit environment

**After (Portable):**
- Email disabled by default
- Requires SMTP setup or third-party service
- Full control over email provider
- Works on any platform

**Migration Note:** You must configure SMTP or an email service to enable email notifications

---

### OAuth Callbacks

**Before (Replit):**
- Callback URL: `https://{REPLIT_DEV_DOMAIN}/api/auth/*/callback`
- Automatically determined from environment

**After (Portable):**
- Callback URL: `{APP_URL}/api/auth/*/callback`
- Must be set explicitly in `.env`
- Update OAuth provider settings when deploying

**Migration Note:** Update Google/Discord OAuth settings with new callback URLs

---

### CORS Configuration

**Before (Replit):**
- `REPLIT_DOMAINS` - Comma-separated production domains
- `REPLIT_DEV_DOMAIN` - Development domain

**After (Portable):**
- `ALLOWED_ORIGINS` - Comma-separated allowed origins
- `APP_URL` - Your application URL
- More flexible, works with any domain

---

## Testing Checklist

Use this checklist to verify the portable version works correctly:

### ✅ Basic Functionality
- [ ] App starts with `npm run dev`
- [ ] App builds with `npm run build`
- [ ] Production mode runs with `npm start`
- [ ] Homepage loads correctly
- [ ] No console errors about missing modules

### ✅ Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Password reset flow works (if email configured)
- [ ] Google OAuth works (if configured)
- [ ] Discord OAuth works (if configured)

### ✅ Content Management
- [ ] Browse manga/series works
- [ ] Chapter pages load correctly
- [ ] Reading progress saves
- [ ] Comments work

### ✅ Admin Panel
- [ ] Admin login works
- [ ] Can create new series
- [ ] Can upload chapter images
- [ ] Uploaded images display correctly
- [ ] Can manage users

### ✅ File Uploads
- [ ] Cover image upload works
- [ ] Chapter ZIP upload works
- [ ] Images save to `public/uploads/`
- [ ] Uploaded images accessible via browser

### ✅ Payments (if Stripe configured)
- [ ] Stripe integration loads
- [ ] Can purchase coins
- [ ] Webhooks process correctly

### ✅ Email (if SMTP configured)
- [ ] Verification emails send
- [ ] Password reset emails send
- [ ] DMCA notification emails send

### ✅ Database
- [ ] SQLite database creates automatically
- [ ] Data persists between restarts
- [ ] Migrations work

### ✅ Production Deployment
- [ ] App deploys successfully
- [ ] Environment variables load correctly
- [ ] No Replit-related errors in logs
- [ ] SSL/HTTPS works
- [ ] WebSocket connections work

---

## Environment Variable Migration

If migrating from Replit, update your environment variables:

| Replit Variable | Portable Variable | Notes |
|----------------|-------------------|-------|
| `REPLIT_DEV_DOMAIN` | `APP_URL` | Full URL including https:// |
| `REPLIT_DOMAINS` | `ALLOWED_ORIGINS` | Comma-separated list |
| `REPL_SLUG` | N/A | Not needed (local storage) |
| `REPL_IDENTITY` | N/A | Not needed (no Replit Mail) |
| `WEB_REPL_RENEWAL` | N/A | Not needed (no Replit Mail) |

**New variables to set:**
- `APP_URL` - Your deployed URL
- `ALLOWED_ORIGINS` - CORS whitelist (optional)
- `SMTP_*` - Email configuration (optional)

---

## Known Limitations

1. **Email Disabled by Default**
   - Requires manual SMTP setup
   - See `server/utils/email.ts` for instructions

2. **Local File Storage**
   - Uploaded images stored on disk
   - May not persist on some free hosting platforms
   - Consider migrating to cloud storage (S3, R2) for production

3. **No Automatic Backups**
   - SQLite database requires manual backup
   - Use `npm run db:backup` regularly
   - Consider automated backup scripts

4. **OAuth Callback URLs**
   - Must be updated in OAuth provider settings
   - Different for each deployment environment

---

## Future Improvements

Potential enhancements for better portability:

1. **Cloud Storage Option**
   - Add AWS S3 / Cloudflare R2 support
   - Keep local storage as fallback

2. **Email Service Abstraction**
   - Support multiple email providers
   - Auto-detect based on environment variables

3. **Database Migration**
   - Add PostgreSQL support option
   - Keep SQLite for simplicity

4. **Docker Support**
   - Create Dockerfile for containerized deployment
   - Docker Compose for local development

---

## Support

**For Deployment Issues:**
- See `DEPLOYMENT.md` for detailed instructions
- Check hosting platform documentation
- Review troubleshooting section

**For Code Issues:**
- Check original `replit.md` for architecture details
- Review error logs for specific issues
- Ensure all environment variables are set correctly

**For Migration Issues:**
- Compare environment variables (see table above)
- Check OAuth callback URLs updated
- Verify SMTP/email configuration if needed

---

**Document Version:** 1.0  
**Last Updated:** October 29, 2025  
**Compatibility:** Node.js 18+, Any standard hosting platform

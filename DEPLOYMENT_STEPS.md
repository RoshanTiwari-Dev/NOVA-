# Nova Chatbot - Complete Deployment Guide (Render + Vercel)

## Quick Summary

This guide deploys Nova chatbot with:
- **Backend**: Render (Node.js/Express)
- **Frontend**: Vercel (React)
- **Communication**: tRPC over HTTPS

**Estimated time**: 20-30 minutes

---

## Prerequisites

Before starting, gather these values from your Manus project:

1. **Database Connection String** (MySQL/TiDB)
   - Format: `mysql://username:password@host:port/database`

2. **OAuth Credentials**
   - `VITE_APP_ID`
   - `OAUTH_SERVER_URL` (usually `https://api.manus.im`)

3. **Owner Information**
   - `OWNER_OPEN_ID`
   - `OWNER_NAME`

4. **API Keys**
   - `BUILT_IN_FORGE_API_KEY`
   - `BUILT_IN_FORGE_API_URL` (usually `https://api.manus.im`)

5. **JWT Secret** (generate a random string, e.g., using `openssl rand -base64 32`)

---

## Step-by-Step Deployment

### STEP 1: Verify GitHub Repository ✅

Your code is already at: `https://github.com/RoshanTiwari-Dev/NOVA-`

Verify the latest code is pushed:
```bash
cd /path/to/NOVA-
git status
git push origin main
```

---

### STEP 2: Deploy Backend on Render 🚀

#### 2.1: Create Render Account
- Visit [render.com](https://render.com)
- Click **"Sign up"**
- Choose **"Sign up with GitHub"**
- Authorize Render to access your GitHub account

#### 2.2: Create Web Service
1. Click **"New +"** in top-right corner
2. Select **"Web Service"**
3. Click **"Connect"** next to your `RoshanTiwari-Dev/NOVA-` repository
4. Click **"Connect"** to authorize

#### 2.3: Configure Web Service
Fill in the configuration form:

```
Name:                    nova-chatbot-backend
Environment:             Node
Region:                  Singapore (or closest to you)
Branch:                  main
Build Command:           pnpm install && pnpm run build:backend
Start Command:           NODE_ENV=production node dist/index.js
```

#### 2.4: Add Environment Variables
Click **"Environment"** section and add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Fixed |
| `DATABASE_URL` | `mysql://...` | Your database connection string |
| `JWT_SECRET` | (random string) | Generate with: `openssl rand -base64 32` |
| `VITE_APP_ID` | (from Manus) | OAuth app ID |
| `OAUTH_SERVER_URL` | `https://api.manus.im` | Fixed |
| `OWNER_OPEN_ID` | (from Manus) | Your owner ID |
| `OWNER_NAME` | (your name) | Your name |
| `BUILT_IN_FORGE_API_URL` | `https://api.manus.im` | Fixed |
| `BUILT_IN_FORGE_API_KEY` | (from Manus) | API key |

#### 2.5: Deploy
1. Click **"Create Web Service"**
2. Wait for build to complete (3-5 minutes)
3. You'll see a URL like: `https://nova-chatbot-backend.onrender.com`
4. **Save this URL** - you'll need it for the frontend

#### 2.6: Verify Backend
Once deployed, test it:
```bash
curl https://nova-chatbot-backend.onrender.com/api/trpc
```

You should get a response (may be an error, but the server is responding).

---

### STEP 3: Deploy Frontend on Vercel 🎨

#### 3.1: Create Vercel Account
- Visit [vercel.com](https://vercel.com)
- Click **"Sign up"**
- Choose **"Sign up with GitHub"**
- Authorize Vercel to access your GitHub account

#### 3.2: Import Project
1. Click **"Add New"** → **"Project"**
2. Click **"Import Git Repository"**
3. Search for `NOVA-` and select `RoshanTiwari-Dev/NOVA-`
4. Click **"Import"**

#### 3.3: Configure Project
In the **"Configure Project"** screen:

```
Project Name:        nova-chatbot-frontend
Framework Preset:    Vite
Root Directory:      ./ (leave as default)
Build Command:       pnpm run build:frontend
Output Directory:    dist
```

#### 3.4: Add Environment Variables
1. Click **"Environment Variables"**
2. Add this variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://nova-chatbot-backend.onrender.com/api/trpc` |

**⚠️ IMPORTANT**: Replace with your actual Render backend URL from Step 2.5

#### 3.5: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (1-2 minutes)
3. You'll get a URL like: `https://nova-chatbot-frontend.vercel.app`
4. **This is your live chatbot URL**

#### 3.6: Verify Frontend
1. Visit your Vercel URL
2. The chatbot should load
3. Try sending a message to test the backend connection

---

### STEP 4: Test the Connection 🧪

#### 4.1: Test from Frontend
1. Open your Vercel URL in a browser
2. Open Developer Console (F12)
3. Try sending a message
4. Check the **"Network"** tab to see API calls to Render backend
5. Verify responses are coming back

#### 4.2: Check Logs
- **Render**: Dashboard → Your Web Service → **"Logs"** tab
- **Vercel**: Dashboard → Your Project → **"Deployments"** → **"Logs"**

---

### STEP 5: Fix CORS (if needed) 🔧

If you see CORS errors in the browser console:

#### 5.1: Update Backend
Edit `server/_core/index.ts`:

```typescript
import cors from 'cors';

// Add after app initialization
app.use(cors({
  origin: 'https://nova-chatbot-frontend.vercel.app',
  credentials: true
}));
```

#### 5.2: Install CORS Package
```bash
pnpm add cors
pnpm add -D @types/cors
```

#### 5.3: Redeploy
1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "fix: Add CORS configuration"
   git push origin main
   ```
2. Render will automatically redeploy
3. Wait for build to complete

---

### STEP 6: Set Up Custom Domain (Optional) 🌐

#### For Backend (Render)
1. Go to Render Dashboard → Your Web Service
2. Click **"Settings"** → **"Custom Domain"**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Follow DNS setup instructions

#### For Frontend (Vercel)
1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Domains"**
3. Add your domain (e.g., `yourdomain.com`)
4. Follow DNS setup instructions

---

## Troubleshooting

### Issue: Backend won't build
**Solution**:
- Check Render build logs for errors
- Verify all environment variables are set
- Ensure `pnpm` is installed: `npm install -g pnpm`

### Issue: Frontend shows blank page
**Solution**:
- Open browser console (F12)
- Check for JavaScript errors
- Verify `VITE_API_URL` is set correctly in Vercel
- Ensure Render backend is running

### Issue: CORS errors in console
**Solution**:
- Add CORS middleware to backend (see Step 5)
- Redeploy backend
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: Slow initial load
**Solution**:
- This is normal for Render free tier (30-40 second cold start)
- Upgrade to paid plan for faster response times
- Or use Render's "Always On" feature

### Issue: Database connection fails
**Solution**:
- Verify `DATABASE_URL` is correct
- Check database is accessible from Render
- Ensure database credentials are correct
- Check database firewall allows Render IP

---

## Environment Variables Checklist

### Backend (Render)
- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = Your MySQL connection string
- [ ] `JWT_SECRET` = Random secure string
- [ ] `VITE_APP_ID` = From Manus OAuth
- [ ] `OAUTH_SERVER_URL` = `https://api.manus.im`
- [ ] `OWNER_OPEN_ID` = Your owner ID
- [ ] `OWNER_NAME` = Your name
- [ ] `BUILT_IN_FORGE_API_URL` = `https://api.manus.im`
- [ ] `BUILT_IN_FORGE_API_KEY` = From Manus

### Frontend (Vercel)
- [ ] `VITE_API_URL` = Your Render backend URL

---

## Next Steps

1. **Monitor Deployments**
   - Set up alerts in Render and Vercel
   - Check logs regularly

2. **Set Up Error Tracking**
   - Use Sentry or similar service
   - Monitor frontend and backend errors

3. **Performance Optimization**
   - Enable Vercel Analytics
   - Monitor API response times

4. **Backup & Recovery**
   - Set up database backups
   - Document your deployment process

5. **Custom Domain**
   - Purchase domain if needed
   - Configure DNS records
   - Set up SSL certificates

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **tRPC Docs**: https://trpc.io/docs
- **GitHub**: https://github.com/RoshanTiwari-Dev/NOVA-

---

## Quick Reference URLs

After deployment, save these URLs:

- **Frontend**: `https://nova-chatbot-frontend.vercel.app`
- **Backend API**: `https://nova-chatbot-backend.onrender.com/api/trpc`
- **GitHub**: `https://github.com/RoshanTiwari-Dev/NOVA-`
- **Render Dashboard**: `https://dashboard.render.com`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

---

**Last Updated**: June 2026
**Status**: Ready for deployment ✅

# Nova Chatbot - Render Backend Deployment Guide

This guide walks you through deploying the Nova chatbot backend on Render and the frontend on Vercel.

## Architecture Overview

- **Backend (Render)**: Node.js/Express API server with tRPC, database integration, and OAuth
- **Frontend (Vercel)**: React 19 static site that communicates with Render backend
- **Database**: MySQL/TiDB (managed separately, or via Render PostgreSQL)

---

## Part 1: Deploy Backend on Render

### Step 1: Prepare Your GitHub Repository

Your repository is already synced at: `https://github.com/RoshanTiwari-Dev/NOVA-`

Ensure the latest code is pushed:
```bash
git status
git push origin main
```

### Step 2: Create a Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended for easy integration)
3. Authorize Render to access your GitHub repositories

### Step 3: Create a New Web Service on Render

1. Click **"New +"** button in the top-right corner
2. Select **"Web Service"**
3. Connect your GitHub repository: `RoshanTiwari-Dev/NOVA-`
4. Select the repository and click **"Connect"**

### Step 4: Configure the Web Service

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `nova-chatbot-backend` |
| **Environment** | `Node` |
| **Region** | Choose closest to your users (e.g., Singapore, US East) |
| **Branch** | `main` |
| **Build Command** | `pnpm install && pnpm run build:backend` |
| **Start Command** | `NODE_ENV=production node dist/index.js` |

### Step 5: Add Environment Variables

Click **"Environment"** and add the following variables:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Production environment |
| `DATABASE_URL` | `mysql://user:pass@host/db` | Your MySQL connection string |
| `JWT_SECRET` | (Generate a secure random string) | Session signing key |
| `VITE_APP_ID` | (From Manus OAuth) | OAuth application ID |
| `OAUTH_SERVER_URL` | `https://api.manus.im` | OAuth server URL |
| `OWNER_OPEN_ID` | (Your Manus owner ID) | Owner identification |
| `OWNER_NAME` | (Your name) | Owner name |
| `BUILT_IN_FORGE_API_URL` | `https://api.manus.im` | Manus API URL |
| `BUILT_IN_FORGE_API_KEY` | (Your API key) | Manus API key |

**Note**: Get these values from your Manus project settings.

### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your backend
3. Wait for the deployment to complete (usually 3-5 minutes)
4. Note the URL: `https://nova-chatbot-backend.onrender.com` (your actual URL will be shown)

### Step 7: Verify Backend Deployment

Once deployed, test the backend:

```bash
curl https://nova-chatbot-backend.onrender.com/api/trpc
```

You should get a response (may be an error, but the server is responding).

---

## Part 2: Deploy Frontend on Vercel

### Step 1: Create a Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your GitHub repositories

### Step 2: Import Your Project

1. Click **"Add New"** → **"Project"**
2. Select **"Import Git Repository"**
3. Search for and select `RoshanTiwari-Dev/NOVA-`
4. Click **"Import"**

### Step 3: Configure Project Settings

In the **"Configure Project"** screen:

| Setting | Value |
|---------|-------|
| **Project Name** | `nova-chatbot-frontend` |
| **Framework Preset** | `Vite` |
| **Root Directory** | `./` (default) |
| **Build Command** | `pnpm run build:frontend` |
| **Output Directory** | `dist` |

### Step 4: Add Environment Variables

Before deploying, add environment variables:

1. Click **"Environment Variables"**
2. Add the following:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://nova-chatbot-backend.onrender.com/api/trpc` |

**Important**: Replace with your actual Render backend URL from Step 1.

### Step 5: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. Wait for deployment to complete (usually 1-2 minutes)
4. You'll get a URL like: `https://nova-chatbot-frontend.vercel.app`

### Step 6: Verify Frontend Deployment

1. Visit your Vercel URL
2. The chatbot should load
3. Try sending a message to test the connection to the Render backend

---

## Part 3: Configure CORS (if needed)

If you get CORS errors when the frontend tries to connect to the backend:

### Update Backend CORS Configuration

Edit `server/_core/index.ts` and add CORS middleware:

```typescript
import cors from 'cors';

app.use(cors({
  origin: 'https://nova-chatbot-frontend.vercel.app',
  credentials: true
}));
```

Then redeploy to Render.

---

## Part 4: Connect Custom Domain (Optional)

### For Render Backend

1. In Render dashboard, go to your Web Service
2. Click **"Settings"** → **"Custom Domain"**
3. Enter your domain (e.g., `api.yourdomain.com`)
4. Follow DNS setup instructions

### For Vercel Frontend

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your domain (e.g., `yourdomain.com`)
4. Follow DNS setup instructions

---

## Troubleshooting

### Backend won't start on Render

- Check the build logs in Render dashboard
- Verify all environment variables are set
- Ensure `package.json` has the correct build script

### Frontend shows blank page

- Check browser console for errors (F12)
- Verify `VITE_API_URL` is set correctly in Vercel
- Check that the Render backend is running and accessible

### CORS errors

- Add CORS middleware to the backend (see Part 3)
- Ensure frontend URL is whitelisted in backend CORS config

### Slow initial load (Render cold start)

- Render free tier has cold starts (30-40 seconds)
- Upgrade to paid plan for faster response times
- Or use Render's "Always On" feature

---

## Environment Variables Reference

### Backend (Render)

```
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host/db
JWT_SECRET=your-secure-random-string
VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
```

### Frontend (Vercel)

```
VITE_API_URL=https://nova-chatbot-backend.onrender.com/api/trpc
```

---

## Next Steps

1. Monitor your deployments in Render and Vercel dashboards
2. Set up error tracking (e.g., Sentry)
3. Configure custom domains for production
4. Set up CI/CD for automatic deployments on code push

For more help, refer to:
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [tRPC Documentation](https://trpc.io/docs)

# HackHazard Deployment Guide for Vercel

## Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (free) for production database

## Step 1: Prepare for Deployment

### Backend Preparation
- ✅ `vercel.json` created
- ✅ Environment variables template created
- ✅ CORS settings updated

### Frontend Preparation
- ✅ `vercel.json` already exists
- ✅ Production environment template created
- ✅ WebSocket URL updated

## Step 2: Deploy Backend

1. **Navigate to Backend directory:**
   ```powershell
   cd "z:\HackHazard\Backend"
   ```

2. **Initialize git (if not done):**
   ```powershell
   git init
   git add .
   git commit -m "Initial backend commit for Vercel deployment"
   ```

3. **Push to GitHub:**
   - Create a new repository: `hackhazard-backend`
   - Run:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/hackhazard-backend.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy on Vercel:**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your backend repository
   - Set these environment variables:
     - `GMAIL_APP_PASSWORD`: (from your current .env)
     - `GMAIL_USER`: (from your current .env)
     - `GOOGLE_CLIENT_ID`: (from your current .env)
     - `GOOGLE_CLIENT_SECRET`: (from your current .env)
     - `JWT_SECRET`: (from your current .env)
     - `GROQ_API_KEY`: (from your current .env)
     - `MONGO_URI`: mongodb+srv://your-atlas-connection-string
     - `NODE_ENV`: production
     - `CLIENT_URL`: (will add after frontend deployment)
     - `FRONTEND_URL`: (will add after frontend deployment)
     - `GOOGLE_REDIRECT_URI`: https://YOUR-BACKEND-URL.vercel.app/auth/google/callback

   **Note:** Copy your backend URL after deployment (e.g., `https://hackhazard-backend.vercel.app`)

## Step 3: Deploy Frontend

1. **Update frontend environment:**
   ```powershell
   cd "z:\HackHazard\Frontend"
   ```
   
   Edit `.env.production` and replace `your-backend-app.vercel.app` with your actual backend URL.

2. **Initialize git:**
   ```powershell
   git init
   git add .
   git commit -m "Initial frontend commit for Vercel deployment"
   ```

3. **Push to GitHub:**
   - Create a new repository: `hackhazard-frontend`
   - Run:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/hackhazard-frontend.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy on Vercel:**
   - Import your frontend repository
   - Set environment variable:
     - `VITE_API_URL`: https://YOUR-BACKEND-URL.vercel.app

   **Note:** Copy your frontend URL after deployment

## Step 4: Update Backend CORS

1. Go back to your backend Vercel dashboard
2. Update these environment variables:
   - `CLIENT_URL`: https://YOUR-FRONTEND-URL.vercel.app
   - `FRONTEND_URL`: https://YOUR-FRONTEND-URL.vercel.app

## Step 5: Set Up MongoDB Atlas (if using local MongoDB)

1. Go to https://mongodb.com/atlas
2. Create a free cluster
3. Create a database user
4. Get the connection string
5. Update `MONGO_URI` in backend environment variables

## Step 6: Test Your Deployment

1. Visit your frontend URL
2. Test all functionality:
   - User registration/login
   - Habit creation
   - Challenges
   - Email notifications
   - Real-time updates

## Troubleshooting Tips

### Common Issues:
1. **CORS errors**: Check that frontend URL is added to backend CORS origins
2. **Environment variables**: Ensure all variables are set in Vercel dashboard
3. **Database connection**: Verify MongoDB Atlas connection string
4. **Email service**: Check Gmail app password and 2FA settings

### Useful Commands:
```powershell
# Check git status
git status

# View environment variables (local)
Get-Content .env

# Test API endpoints
curl https://your-backend-url.vercel.app/api/habits
```

## Security Notes

- Never commit `.env` files to git
- Use strong JWT secrets
- Enable MongoDB Atlas IP whitelist (0.0.0.0/0 for Vercel)
- Use HTTPS URLs in production environment variables

## Post-Deployment

1. Update any hardcoded URLs in your codebase
2. Test all features thoroughly
3. Monitor Vercel deployment logs for errors
4. Set up custom domains if needed

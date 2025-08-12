# GenConnect Backend Deployment Guide

## Deploying to Railway

### Prerequisites
1. **GitHub Account** - Your code must be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)

### Step 1: Prepare Your Repository

1. **Commit and push your changes** to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Ensure your repository is public** (Railway free tier requirement)

### Step 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)** and sign in with GitHub
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your GenConnect repository**
5. **Select the `server` directory** as the source
6. **Click "Deploy"**

### Step 3: Configure Environment Variables

In your Railway project dashboard, go to **Variables** and add:

```
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
CORS_ORIGIN=https://www.genconnect.live
```

### Step 4: Get Your Production URL

1. **Go to your Railway project dashboard**
2. **Copy the generated domain** (e.g., `https://genconnect-server-production.up.railway.app`)
3. **This is your production API URL**

### Step 5: Update Frontend Configuration

Update your client's API configuration to point to the production server:

```typescript
// client/src/config/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-railway-url.up.railway.app/api'  // Your Railway URL
  : 'http://localhost:5001/api';
```

### Step 6: Deploy Frontend

1. **Build your React app**:
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to your hosting service** (Vercel, Netlify, etc.)

## Alternative: Deploy Both Frontend and Backend to Railway

You can also deploy both parts to Railway:

1. **Deploy backend** as shown above
2. **Deploy frontend** by creating another Railway service pointing to the `client` directory
3. **Set build command** to: `npm run build`
4. **Set start command** to: `npx serve -s build -l 3000`

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | Yes |
| `PORT` | Server port (Railway sets this) | No |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `CORS_ORIGIN` | Allowed origins for CORS | Yes |

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are in `package.json`
2. **CORS errors**: Verify `CORS_ORIGIN` is set correctly
3. **Database issues**: Railway provides persistent storage, but SQLite files may not persist

### Health Check:

Your server includes a health check endpoint at `/health` that Railway will use to verify deployment.

## Next Steps

After deployment:
1. Test your API endpoints
2. Update your frontend to use the production API
3. Test the signup flow on your live site
4. Monitor logs in Railway dashboard

## Support

- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)

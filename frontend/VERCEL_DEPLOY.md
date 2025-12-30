# Vercel Deployment Guide

## Quick Deploy Steps

### 1. Login to Vercel
```bash
cd frontend
vercel login
```
This will open a browser window to authenticate your Vercel account.

### 2. Deploy to Production
```bash
vercel --prod
```

### 3. Follow the Prompts
- Link to existing project? **No**
- What's your project's name? **solana-pump-bot** (or your preferred name)
- In which directory is your code located? **./** (current directory)
- Want to override the settings? **No** (or customize if needed)

## Environment Variables

After deployment, you may need to configure environment variables in the Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add any required variables:
   - `VITE_SOLANA_RPC_URL`
   - `VITE_API_ENDPOINT` (if connecting to backend)

## Automatic Deployment

For continuous deployment, connect your GitHub repository:

1. Push your code to GitHub
2. In Vercel dashboard, click **Add New → Project**
3. Import your GitHub repository
4. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings → Domains**
2. Add your custom domain
3. Configure DNS records as instructed

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed
- Check `package.json` build script
- Verify TypeScript configuration

### Deployment Issues
- Clear Vercel cache: `vercel rm --yes`
- Redeploy: `vercel --prod --force`

### Environment Variables Not Working
- Variables must be prefixed with `VITE_` for client-side access
- Restart deployment after adding variables

## Production URL

After successful deployment, Vercel will provide you with:
- **Production URL**: `https://your-project-name.vercel.app`
- **Preview URLs**: For each deployment

## Next Steps

1. Configure your backend API endpoint in the frontend
2. Set up CORS on your backend if needed
3. Test the deployed application
4. Monitor logs in Vercel dashboard

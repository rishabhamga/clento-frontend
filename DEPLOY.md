# Deploy to Cloud Run (Simple)

## What Changed

✅ **No more environment variable issues!**  
✅ **No cloudbuild.yaml needed!**  
✅ **Deploy directly from Cloud Run UI (just like the backend)**

The Clerk publishable key and other config are now hardcoded in the Dockerfile, so the build will always succeed.

## How to Deploy

### Option 1: Cloud Run UI (Recommended)

1. Go to https://console.cloud.google.com/run
2. Click **"Create Service"**
3. Select **"Continuously deploy from a repository"**
4. Click **"Set up with Cloud Build"**
5. Connect your GitHub repository: `rishabhamga/clento-frontend`
6. Select branch: `main`
7. Build type: **Dockerfile**
8. Click **"Save"**
9. Configure service:
   - Service name: `clento-frontend`
   - Region: `asia-south1`
   - Authentication: **Allow unauthenticated invocations**
   - Container port: `3000`
   - Memory: `512Mi`
   - CPU: `1`
10. Under **"Environment Variables"**, add:
    - `CLERK_SECRET_KEY` = `sk_test_El3pHN9Rqd1BlBzT2nOpllNOMEQzxoufh`
11. Click **"Create"**

That's it! Your app will deploy successfully. ✅

### Option 2: Command Line

```bash
gcloud run deploy clento-frontend \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars CLERK_SECRET_KEY=sk_test_El3pHN9Rqd1BlBzT2nOpllNOMEQzxoufh \
  --memory 512Mi \
  --cpu 1 \
  --port 3000
```

## Environment Variables

**You only need to set this in Cloud Run:**
- `CLERK_SECRET_KEY` - Server-side secret (set in Cloud Run UI under "Environment Variables")

**Everything else is hardcoded in the Dockerfile:**
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Hardcoded
- ✅ `NEXT_PUBLIC_API_URL` - Hardcoded  
- ✅ `NEXT_PUBLIC_APP_NAME` - Hardcoded

## Update Backend URL (Optional)

If you want to change the backend API URL, edit line 23 in `Dockerfile`:

```dockerfile
ENV NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Change to your actual backend URL:

```dockerfile
ENV NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

Then commit and push - Cloud Run will automatically redeploy.

## Troubleshooting

### Build fails with "Missing publishableKey"
**Solution:** Make sure you pushed the latest code. The Dockerfile now has hardcoded values.

### App loads but can't connect to backend
**Solution:** Update `NEXT_PUBLIC_API_URL` in the Dockerfile to your actual backend URL.

### Authentication doesn't work
**Solution:** Make sure `CLERK_SECRET_KEY` is set in Cloud Run environment variables.

## That's It!

No more complex build configurations. Just deploy from the UI like you did with the backend. ✅

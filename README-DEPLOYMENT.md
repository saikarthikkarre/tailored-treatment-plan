# Tailored Treatment Plan - Deployment Guide

## Quick Start for Render Deployment

### 1. Prepare Your Repository

Your repository should have the following structure:
```
tailored-treatment-plan/
├── fastapibackend/
│   ├── main.py
│   ├── start.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── render.yaml
├── Dockerfile
└── env.example
```

### 2. Environment Variables Setup

In your Render dashboard, add these environment variables:

**Required AWS Variables:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g., us-east-1)
- `DYNAMODB_TABLE_NAME`
- `BEDROCK_MODEL_ID`
- `KNOWLEDGE_BASE_ID`

**Required IBM Variables:**
- `IBM_API_KEY`
- `IBM_API_URL`
- `WATSONX_PROJECT_ID`

### 3. Deployment Methods

#### Method A: Using render.yaml (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Render will automatically detect `render.yaml` and deploy both services

#### Method B: Manual Deployment
1. **Backend Service:**
   - Create new Web Service
   - Build Command: `pip install -r fastapibackend/requirements.txt`
   - Start Command: `cd fastapibackend && python start.py`
   - Environment: Python

2. **Frontend Service:**
   - Create new Static Site
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

#### Method C: Docker Deployment
1. Use the provided `Dockerfile`
2. Deploy as Docker service
3. Single container with both frontend and backend

### 4. Local Testing

**Backend:**
```bash
cd fastapibackend
pip install -r requirements.txt
python start.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Build for Production:**
```bash
# Windows
build.bat

# Linux/Mac
./build.sh
```

### 5. API Endpoints

Once deployed, your application will have:
- `GET /` - Frontend application
- `GET /health` - Health check
- `POST /patients` - Create patient
- `GET /patients/{id}` - Get patient
- `POST /patients/{id}/summarize` - Generate summary
- `GET /patients/{id}/plan` - Get treatment plan
- `POST /patients/{id}/plan` - Generate treatment plan
- `POST /chat` - Chat with knowledge base

### 6. Troubleshooting

**Common Issues:**
- **CORS errors**: Backend has CORS configured for all origins
- **Environment variables**: Check all required variables are set
- **Build failures**: Ensure all dependencies are in requirements.txt
- **API connection**: Frontend uses `VITE_API_URL` environment variable

**Health Checks:**
- Backend: `https://your-app.onrender.com/health`
- Frontend: `https://your-app.onrender.com/`

### 7. Security Notes

- Update CORS origins for production
- Use environment variables for all secrets
- Consider AWS IAM roles instead of access keys
- Enable HTTPS in production

### 8. Monitoring

- Check Render dashboard for logs
- Monitor AWS service usage
- Set up health check monitoring
- Watch for build and deployment errors

## Files Created/Modified for Deployment

1. **render.yaml** - Render deployment configuration
2. **Dockerfile** - Container deployment option
3. **fastapibackend/start.py** - Production startup script
4. **fastapibackend/main.py** - Added CORS and static file serving
5. **frontend/vite.config.ts** - Production build configuration
6. **frontend/src/lib/api.ts** - Environment-based API URL
7. **build.sh/build.bat** - Build scripts
8. **env.example** - Environment variables template
9. **.gitignore** - Git ignore file
10. **DEPLOYMENT.md** - Detailed deployment guide

# Backend-Only Deployment Guide

This guide shows how to deploy only the backend API service to Render.

## Quick Deployment Options

### Option 1: Using render.yaml (Recommended)

1. **Rename the backend-only config:**
   ```bash
   mv render-backend-only.yaml render.yaml
   ```

2. **Push to GitHub and connect to Render**
   - Render will automatically detect the `render.yaml` file
   - Deploy the backend service only

### Option 2: Manual Deployment

1. **Create a new Web Service on Render**
2. **Configure the service:**
   - **Build Command:** `pip install -r fastapibackend/requirements.txt`
   - **Start Command:** `cd fastapibackend && python start.py`
   - **Environment:** Python
   - **Plan:** Starter (or higher)

### Option 3: Docker Deployment

1. **Use the backend-only Dockerfile:**
   ```bash
   # Use Dockerfile.backend or the updated Dockerfile
   docker build -t tailored-treatment-api .
   docker run -p 8000:8000 tailored-treatment-api
   ```

## Environment Variables

Set these in your Render dashboard:

### Required Variables:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g., us-east-1)
- `DYNAMODB_TABLE_NAME`
- `BEDROCK_MODEL_ID`
- `KNOWLEDGE_BASE_ID`
- `IBM_API_KEY`
- `IBM_API_URL`
- `WATSONX_PROJECT_ID`

### Optional Variables:
- `PORT` (defaults to 8000)

## API Endpoints

Once deployed, your API will be available at:
- `GET /` - API status
- `GET /health` - Health check
- `POST /patients` - Create a new patient
- `GET /patients/{id}` - Get patient data
- `POST /patients/{id}/summarize` - Generate patient summary
- `GET /patients/{id}/plan` - Get treatment plan
- `POST /patients/{id}/plan` - Generate treatment plan
- `POST /chat` - Chat with knowledge base

## Testing Your Deployment

1. **Health Check:**
   ```bash
   curl https://your-app.onrender.com/health
   ```

2. **API Documentation:**
   Visit `https://your-app.onrender.com/docs` for interactive API documentation

3. **Test Patient Creation:**
   ```bash
   curl -X POST https://your-app.onrender.com/patients \
     -H "Content-Type: application/json" \
     -d '{"patientId":"test123","age":30,"gender":"Male","primaryCondition":"Test","comorbidities":[],"geneticMarkers":{},"lifestyle":{},"currentMedications":[]}'
   ```

## Files for Backend-Only Deployment

- `fastapibackend/main.py` - Main API application
- `fastapibackend/start.py` - Production startup script
- `fastapibackend/requirements.txt` - Python dependencies
- `Dockerfile` - Backend-only container
- `render-backend-only.yaml` - Render configuration
- `env.example` - Environment variables template

## Troubleshooting

### Common Issues:
1. **Build Failures:** Check that all dependencies are in requirements.txt
2. **Environment Variables:** Ensure all required variables are set
3. **CORS Issues:** Backend has CORS configured for all origins
4. **Port Issues:** Render automatically sets the PORT environment variable

### Health Checks:
- `GET /health` should return `{"status": "healthy", "version": "2.1.0"}`
- Check Render logs for any startup errors

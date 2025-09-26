# Deployment Guide for Tailored Treatment Plan

This guide explains how to deploy the Tailored Treatment Plan application to Render.

## Prerequisites

1. **AWS Account**: You need AWS credentials for DynamoDB and Bedrock services
2. **IBM Cloud Account**: For Watson AI services
3. **Render Account**: For hosting the application

## Environment Variables

Copy the `env.example` file and configure the following variables in your Render dashboard:

### AWS Configuration
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_REGION`: AWS region (e.g., us-east-1)
- `DYNAMODB_TABLE_NAME`: Your DynamoDB table name
- `BEDROCK_MODEL_ID`: AWS Bedrock model ID (e.g., anthropic.claude-3-sonnet-20240229-v1:0)
- `KNOWLEDGE_BASE_ID`: Your Bedrock knowledge base ID

### IBM Watson Configuration
- `IBM_API_KEY`: Your IBM Cloud API key
- `IBM_API_URL`: IBM Watson API endpoint
- `WATSONX_PROJECT_ID`: Your Watson project ID

## Deployment Options

### Option 1: Using render.yaml (Recommended)

1. Push your code to a Git repository
2. Connect the repository to Render
3. Render will automatically detect the `render.yaml` file and deploy both services

### Option 2: Manual Deployment

#### Backend Service
1. Create a new Web Service on Render
2. Choose "Build and deploy from a Git repository"
3. Set the following:
   - **Build Command**: `pip install -r fastapibackend/requirements.txt`
   - **Start Command**: `cd fastapibackend && python main.py`
   - **Environment**: Python
   - **Plan**: Starter (or higher)

#### Frontend Service
1. Create a new Static Site on Render
2. Set the following:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment**: Static

### Option 3: Docker Deployment

1. Use the provided `Dockerfile`
2. Deploy as a Docker service on Render
3. The Dockerfile builds both frontend and backend in a single container

## Local Development Setup

1. **Backend Setup**:
   ```bash
   cd fastapibackend
   pip install -r requirements.txt
   python main.py
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   # Windows
   build.bat
   
   # Linux/Mac
   ./build.sh
   ```

## API Endpoints

Once deployed, your API will be available at:
- `GET /` - Serves the frontend application
- `GET /health` - Health check endpoint
- `POST /patients` - Create a new patient
- `GET /patients/{id}` - Get patient data
- `POST /patients/{id}/summarize` - Generate patient summary
- `GET /patients/{id}/plan` - Get treatment plan
- `POST /patients/{id}/plan` - Generate treatment plan
- `POST /chat` - Chat with knowledge base

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure CORS is properly configured in the backend
2. **Environment Variables**: Ensure all required environment variables are set
3. **Build Failures**: Check that all dependencies are properly specified
4. **API Connection**: Verify the frontend is pointing to the correct backend URL

### Health Checks

- Backend health: `GET /health`
- Frontend: Should load the main application interface

## Security Notes

- In production, update CORS origins to your specific domain
- Use environment variables for all sensitive configuration
- Consider using AWS IAM roles instead of access keys where possible
- Enable HTTPS in production

## Monitoring

- Monitor application logs in Render dashboard
- Set up health check monitoring
- Monitor AWS service usage and costs

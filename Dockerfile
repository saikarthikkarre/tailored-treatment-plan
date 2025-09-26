# Multi-stage build for production deployment
FROM node:18-alpine AS frontend-builder

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY frontend/ ./

# Build frontend
RUN npm run build

# Python backend stage
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY fastapibackend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY fastapibackend/ ./

# Copy built frontend to serve as static files
COPY --from=frontend-builder /app/frontend/dist ./static

# Create a simple static file server for the frontend
RUN echo 'from fastapi.staticfiles import StaticFiles\nfrom fastapi import FastAPI\napp = FastAPI()\napp.mount("/", StaticFiles(directory="static", html=True), name="static")' > serve_static.py

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8000

# Start the application
CMD ["python", "main.py"]

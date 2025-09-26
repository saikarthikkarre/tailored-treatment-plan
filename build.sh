#!/bin/bash

# Build script for production deployment

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Copying frontend build to backend static directory..."
mkdir -p fastapibackend/static
cp -r frontend/dist/* fastapibackend/static/

echo "Build complete!"

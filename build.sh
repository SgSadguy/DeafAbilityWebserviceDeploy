#!/bin/bash

# Build React frontend
echo "Building React frontend..."
cd deafability-frontend
npm install
npm run build
cd ..

# Create static directory if it doesn't exist
mkdir -p deafability/static

# Copy React build files to Django static directory
echo "Copying React build files..."
cp -r deafability-frontend/build/* deafability/static/

echo "Build completed!"

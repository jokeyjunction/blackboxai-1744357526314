#!/bin/bash

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Start backend server in the background
echo "Starting backend server..."
npm start &

# Wait for backend to start
sleep 5

# Start frontend server
echo "Starting frontend server..."
cd ../frontend
python3 -m http.server 8000

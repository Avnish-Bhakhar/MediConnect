#!/bin/bash
echo "🏥 Starting MediConnect..."
echo ""
echo "Starting Backend on port 5000..."
cd backend && npm run dev &
sleep 2
echo "Starting Frontend on port 5173..."
cd ../frontend && npm run dev

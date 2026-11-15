#!/bin/bash
echo "🏥 Starting MediConnect..."
echo ""
echo "Starting Backend on port 5001..."
cd backend && npm run dev &
sleep 2
echo "Starting Next.js Frontend on port 3000..."
cd ../frontend && npm run dev

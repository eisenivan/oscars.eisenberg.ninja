#!/bin/bash

# Svelte Migration Setup Script
# This script helps transition from React to Svelte

echo "🎬 Oscars // Eisenberg // Ninja - Svelte Migration"
echo "=================================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  echo ""
  echo "Your old package.json uses React. You have two options:"
  echo ""
  echo "Option 1: Keep React (development only)"
  echo "  npm install"
  echo ""
  echo "Option 2: Switch to Svelte (recommended)"
  echo "  cp package-svelte.json package.json"
  echo "  npm install"
  echo "  npm run dev"
  echo ""
else
  echo "✅ Node modules already installed"
  echo ""
  echo "Available commands:"
  echo "  npm start      - Run React development server (old)"
  echo "  npm run dev    - Run Svelte development server (new)"
  echo "  npm run build  - Build for production"
  echo ""
fi

echo "📖 Documentation:"
echo "  - SVELTE_MIGRATION.md    - Migration guide"
echo "  - MIGRATION_COMPLETE.md  - Complete migration details"
echo ""

echo "🚀 To get started with Svelte:"
echo "  1. Replace package.json: cp package-svelte.json package.json"
echo "  2. Clear node_modules: rm -rf node_modules package-lock.json"
echo "  3. Install dependencies: npm install"
echo "  4. Start development: npm run dev"
echo ""

echo "📂 Project structure:"
echo "  src/        - Original React application (can be deleted)"
echo "  src-svelte/ - New Svelte application"
echo ""

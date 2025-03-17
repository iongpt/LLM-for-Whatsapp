#!/bin/bash

# Cleanup script for WhatsApp LLM Assistant

# Clean up build directories
echo "Cleaning up build directories..."
rm -rf dist/*
rm -rf release/*
rm -rf build/dist
rm -rf build/mac-arm/WhatsApp*
rm -rf mac-arm-build/*
rm -rf new-build/*

# Remove node_modules (optional)
read -p "Do you want to clean up node_modules too? (y/n) " CLEAN_MODULES
if [[ $CLEAN_MODULES == "y" ]]; then
  echo "Removing node_modules..."
  rm -rf node_modules
  
  echo "Reinstalling dependencies with production flag..."
  NODE_ENV=production npm install
fi

echo "Cleanup complete!"
echo "To build a new package with optimized size run:"
echo "  npm run package:release"
echo ""
echo "This will create optimized packages in the 'release' folder for all platforms."
echo "For a specific platform, you can run:"
echo "  npm run package:mac-arm  (for Mac)"
echo "  npm run package:win      (for Windows)"
echo "  npm run package:linux    (for Linux)"
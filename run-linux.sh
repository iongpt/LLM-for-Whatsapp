#!/bin/bash

echo "Setting up WhatsApp LLM Assistant..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing..."
    
    # Determine the package manager
    if command -v apt &> /dev/null; then
        # Debian/Ubuntu
        sudo apt update
        sudo apt install -y nodejs npm
    elif command -v dnf &> /dev/null; then
        # Fedora
        sudo dnf install -y nodejs npm
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        sudo yum install -y nodejs npm
    elif command -v pacman &> /dev/null; then
        # Arch Linux
        sudo pacman -Sy nodejs npm
    else
        echo "Could not determine package manager. Please install Node.js manually."
        exit 1
    fi
    
    echo "Node.js installed successfully."
else
    echo "Node.js is already installed: $(node -v)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Installing..."
    
    # Determine the package manager again
    if command -v apt &> /dev/null; then
        sudo apt install -y npm
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y npm
    elif command -v yum &> /dev/null; then
        sudo yum install -y npm
    elif command -v pacman &> /dev/null; then
        sudo pacman -Sy npm
    else
        echo "Could not determine package manager. Please install npm manually."
        exit 1
    fi
else
    echo "npm is already installed: $(npm -v)"
fi

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the application
echo "Starting WhatsApp LLM Assistant..."
npm run start

exit 0
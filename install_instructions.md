# WhatsApp LLM Assistant - Installation Instructions

Thank you for downloading WhatsApp LLM Assistant! This document provides instructions for installing and running the application on different operating systems.

## Quick Start

1. Extract the contents of the `release.zip` file to a location of your choice
2. Run the appropriate script for your operating system:

### Windows
- Double-click on `run-windows.bat`
- If asked for administrator permissions, please allow them (needed for Node.js installation)
- If Node.js is installed during the process, you'll need to close the window and run the script again
- This is because Windows needs to update environment variables after Node.js installation

### macOS
- Open Terminal
- Navigate to the extracted directory: `cd path/to/extracted/folder`
- Make the script executable (first time only): `chmod +x run-mac.sh`
- Run the script: `./run-mac.sh`

### Linux
- Open Terminal
- Navigate to the extracted directory: `cd path/to/extracted/folder`
- Make the script executable (first time only): `chmod +x run-linux.sh`
- Run the script: `./run-linux.sh`
- Note: You may need to provide your password for sudo commands if Node.js needs to be installed

## First-Time Setup

- When you first launch the application, you'll need to scan a QR code to link with your WhatsApp account
- Open WhatsApp on your phone
- Tap on Menu (or Settings) > WhatsApp Web > Link a Device
- Scan the QR code shown in the application
- Once linked, your chats will appear in the left sidebar

## What the Setup Script Does

The setup script will:
1. Check if Node.js is installed on your system
2. Install Node.js if it's not already installed
3. Install application dependencies
4. Launch the WhatsApp LLM Assistant application

## Troubleshooting

If you encounter issues:

1. **"electron is not recognized" or "Cannot find module" errors**:
   - Windows: Make sure to run the script again after Node.js installation completes
   - Try running `npm install electron --save-dev` manually in the application directory
   - Run the script again after installation completes

2. **Permission issues**:
   - Windows: Try running the batch file as administrator
   - macOS/Linux: Make sure you've made the script executable with `chmod +x run-mac.sh` or `chmod +x run-linux.sh`

3. **Node.js installation fails**:
   - Windows: Download and install Node.js manually from [nodejs.org](https://nodejs.org/)
   - macOS: Install Homebrew from [brew.sh](https://brew.sh/), then run `brew install node`
   - Linux: Use your distribution's package manager to install nodejs and npm

4. **WhatsApp Web connection issues**:
   - Make sure your computer and phone are connected to the internet
   - Try restarting the application
   - Ensure your WhatsApp mobile app is up to date

5. **Windows-specific issues**:
   - If you see "not recognized as an internal or external command", close the command prompt window and run the script again
   - Windows may need to restart the command prompt to recognize newly installed programs
   - If the issue persists, try running the following commands manually in the application directory:
     ```
     npm install
     npm install electron --save-dev
     npx electron .
     ```
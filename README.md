# WhatsApp LLM Assistant

WhatsApp client with LLM-powered auto-replies for Mac, Windows, and Linux.

## Get Started in Minutes

**Just want to run the app?** Here's how:

1. **[Download release.zip](https://github.com/iongpt/LLM-for-Whatsapp/releases/latest/download/release.zip)** - Get the latest version directly
2. **Extract** the zip file anywhere on your computer
3. **Run** the script for your system:
   - **Windows**: Double-click `run-windows.bat` 
   - **Mac**: Open Terminal, navigate to folder, run `chmod +x run-mac.sh && ./run-mac.sh`
   - **Linux**: Open Terminal, navigate to folder, run `chmod +x run-linux.sh && ./run-linux.sh`

That's it! The script will install everything needed and launch the app.

## Key Features

- **Interactive LLM Integration**: Choose between OpenAI's GPT, local models via Ollama, or other custom LLM APIs
- **Selective Auto-Reply**: Enable or disable auto-reply for specific chats
- **Customizable System Prompts**: Define how your AI assistant should behave in conversations
- **Multi-Platform Support**: Works on Windows, macOS, and Linux
- **Message History**: Maintains conversation context for more coherent responses

## Installation - Quick Setup (Recommended)

1. Download the latest `release.zip` file from the [Releases page](https://github.com/iongpt/LLM-for-Whatsapp/releases)
2. Extract the contents of the ZIP file to any location on your computer
3. Run the appropriate script for your operating system:
   - **Windows**: Double-click `run-windows.bat`
     - If Node.js is installed during setup, you'll need to close and run the script again
   - **macOS**: 
     - Open Terminal
     - Navigate to the extracted folder: `cd path/to/extracted/folder`
     - Make the script executable: `chmod +x run-mac.sh`
     - Run the script: `./run-mac.sh`
   - **Linux**: 
     - Open Terminal
     - Navigate to the extracted folder: `cd path/to/extracted/folder`
     - Make the script executable: `chmod +x run-linux.sh`
     - Run the script: `./run-linux.sh`

For detailed installation instructions, see the included `install_instructions.md` file.

## Installation - Manual Setup (For Developers)

### Prerequisites
- Node.js
- npm or yarn

### Setup and Run

1. Clone the repository
```
git clone https://github.com/iongpt/LLM-for-Whatsapp.git
cd LLM-for-Whatsapp
```

2. Install dependencies
```
npm install
```
or if you prefer yarn:
```
yarn install
```

3. Build the application
```
npm run build
```
or if you prefer yarn:
```
yarn build
```

4. Start the application
```
npm run start
```
or if you prefer yarn:
```
yarn start
```

## WhatsApp Authentication

1. Launch the application
2. Scan the QR code with WhatsApp on your phone (Menu > WhatsApp Web > Link a Device)
3. After authentication, your chats will appear in the left sidebar

## Using Auto-Reply

1. Select a chat from the sidebar
2. Toggle the "Auto-reply" switch to enable AI responses for that chat
3. The assistant will automatically respond to incoming messages in that chat
4. You can also toggle "Auto-reply to all chats" in the Settings tab

## Configuration Options

### LLM Provider Settings
- OpenAI API (requires API key)
- Local models via Ollama
- Custom API endpoints for other LLM providers

### Response Settings
- Temperature: Control randomness of responses (0.0-2.0)
- System prompt: Define assistant behavior
- History length: Number of messages to include for context

## Building Packages

To build for your platform:

```
# For all platforms
npm run package:all

# For Windows
npm run package:win

# For macOS
npm run package:mac

# For Linux
npm run package:linux
```

## Development

```
# Run in development mode with auto-reload
npm run dev

# Run linting
npm run lint
```

You can also use `yarn` instead of `npm run` for all the commands above if you prefer.

## Customizing LLM Integration

For details on integrating custom LLM backends, check out our [custom_LLM.md](custom_LLM.md) guide.

## Utility Scripts

Several utility scripts are included to help with troubleshooting:

- **apply-settings.js**: Applies all necessary settings for reply delay features
- **fix-settings.js**: Fixes issues with default settings
- **debug-settings.js**: Creates a debug window to inspect current settings
- **troubleshoot/inspect-settings.js**: Inspects and modifies settings files

To run these scripts:
```
node apply-settings.js
```

## Disclaimer

This project is not affiliated with WhatsApp or Meta. It uses an unofficial WhatsApp Web client library and should be used responsibly and in accordance with WhatsApp's terms of service.

## License

MIT License
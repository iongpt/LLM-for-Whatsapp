# WhatsApp LLM Assistant

WhatsApp client with LLM-powered auto-replies for Mac, Windows, and Linux.

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
   - Windows: Double-click `run-windows.bat`
   - macOS: Run `./run-mac.sh` in Terminal
   - Linux: Run `./run-linux.sh` in Terminal

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
yarn install
```

3. Build the application
```
yarn build
```

4. Start the application
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
yarn package:all

# For Windows
yarn package:win

# For macOS
yarn package:mac

# For Linux
yarn package:linux
```

## Development

```
# Run in development mode with auto-reload
yarn dev

# Run linting
yarn lint
```

## Customizing LLM Integration

For details on integrating custom LLM backends, check out our [custom_LLM.md](custom_LLM.md) guide.

## Disclaimer

This project is not affiliated with WhatsApp or Meta. It uses an unofficial WhatsApp Web client library and should be used responsibly and in accordance with WhatsApp's terms of service.

## License

MIT License
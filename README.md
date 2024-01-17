# LLM for WhatsApp

## Description
**LLM for WhatsApp** is an application designed to automate responses to WhatsApp messages using an LLM.
I created this for fun and to engage with and potentially wasting the time of scammers. I have used it several times when I was approach by scammers and was a blast. 
In the end, my goal is to have my phone number banned on all scamming lists, marked as "useless".
Of course can be used for any kind of autoresponding needs, it has fully customizable system prompt and list of contacts to interacat with.

Please note that **LLM for WhatsApp** is using [whatsapp.js](https://github.com/pedroslopez/whatsapp-web.js) that is using automation on the Whatsapp web client, a method that is not officially supported by Meta.
For any business purposes, it is recommeded to apply for business API access and use the Whatsapp business API instead of this.

The application integrates with OpenAI's models via API or any custom LLM that's compatible with OpenAI's API interface. For a very quick setup, I recommend [Oobabooga with OpenAI extension](https://github.com/oobabooga/text-generation-webui/wiki/12-%E2%80%90-OpenAI-API) 
and as a model, for English, I recommend [Mistral 7B](https://huggingface.co/mistralai/Mistral-7B-v0.1).

## Features
- Automated responses to WhatsApp messages.
- Support for OpenAI API via API key.
- Support for custom LLMs for complete privacy.
- Customizable for various scenarios where automated messaging via Whatsapp are required.
- Start it for any contact or group and let LLM to continue conversation.
- Give directions to the LLM via the customizable system prompt
- Custom message to start conversation.
- Stop the conversation and resume with custom message


## Getting Started

### Use released binaries

Easiest way to start is to [download binaries](https://github.com/iongpt/LLM-for-Whatsapp/releases/latest) for your OS

### Build from sources

Or you can build from sources followint those steps

### Prerequisites
Before you can run or build LLM for WhatsApp, ensure you have the following installed:
- Node.js
- Yarn package manager

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/iongpt/LLM-for-Whatsapp.git
   ```

2. Navigate to the application directory:
   ```bash
   cd LLM-for-Whatsapp
   ```

3. Install the necessary packages:
   ```bash
   yarn install
   ```

4. Run the preinstall script for extra libraries defined in the app folder:
   ```bash
   yarn run preinstall
   ```

5. Rename app/settings.json.example to app/settings.json

## Usage

### Running in Development Mode
To run the application in development mode:
```bash
yarn run dev
```

### Building the Application
You can build the application for various operating systems using the following commands:

- For Windows:
  ```bash
  yarn run build:win
  ```

- For macOS (Intel):
  ```bash
  yarn run build:osx
  ```

- For macOS (M1):
  ```bash
  yarn run build:osxm1
  ```

- For Linux (x64):
  ```bash
  yarn run build:linux
  ```

- For Linux (32-bit):
  ```bash
  yarn run build:linux32
  ```

- For Linux (ARMv7l):
  ```bash
  yarn run build:linuxarmv7l
  ```

### After application starts
- Authorize Whatsapp client by scanning the QR code with the phone
- Go to the LLM Setting menu (in the top menu bar) select Settings and fill the config in the window (either OpenAI API key, eitther URL for local LLM API)

## Contributing
Contributions to **LLM for WhatsApp** are welcome. Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute.

## Issues
If you encounter any issues or have feature suggestions, please submit them to the [issues page](https://github.com/iongpt/LLM-for-Whatsapp/issues).

## Known issues
- It gets stuck at loading if you have no contacts on Whatsapp. At least one contact is required to load the app
- I only tested it on Mac M1 and Windows x64, it is confirmed to work on Windows, but it will require permission for the app to interact with Chrome

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Author
Developed by IonGPT.

---

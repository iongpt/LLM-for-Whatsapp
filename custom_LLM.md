# LLM Integration Options

The WhatsApp LLM Assistant supports various LLM backends. Here are detailed setup instructions for the recommended options:

## Option 1: OpenAI API

The simplest integration is with OpenAI's API, which provides access to models like GPT-3.5-Turbo and GPT-4.

### Steps for OpenAI Setup

1. Create an account at [OpenAI.com](https://openai.com) if you don't already have one
2. Navigate to the [API Keys section](https://platform.openai.com/api-keys) and create a new API key
3. In the application's LLM Settings:
   - Set Provider to "OpenAI"
   - Enter your API key in the appropriate field
   - Select your desired model (e.g., "gpt-3.5-turbo" or "gpt-4")
   - Adjust temperature and other settings as needed

## Option 2: Ollama (Local Models)

[Ollama](https://ollama.ai/) provides an easy way to run open-source LLMs locally with an OpenAI-compatible API.

### Steps for Ollama Setup

1. Install Ollama from [ollama.ai](https://ollama.ai/)
2. Pull a model of your choice:
   ```bash
   ollama pull mistral    # Or any other model like: llama3, gemma, etc.
   ```
3. Run the Ollama server (it should start automatically after installation)
4. In the application's LLM Settings:
   - Set Provider to "Local"
   - Set the API Endpoint to: `http://localhost:11434/api/generate`
   - Set the model name to match your installed model (e.g., "mistral")
   - Configure your system prompt and other settings

### Recommended Ollama Models

- **mistral** - Good balance of performance and quality
- **llama3** - Meta's latest model with good instruction following
- **gemma** - Google's lightweight model
- **neural-chat** - Optimized for conversational use cases

## Option 3: Custom Endpoints

You can connect to any LLM API that follows OpenAI's API format.

### Popular Options

1. **Oobabooga with OpenAI Extension**:
   - Install [Text Generation WebUI](https://github.com/oobabooga/text-generation-webui)
   - Add the `--api` flag when running
   - Enable the OpenAI extension from the Session tab
   - Use the provided OpenAI-compatible URL in the WhatsApp LLM Assistant

2. **LM Studio**:
   - Install [LM Studio](https://lmstudio.ai/)
   - Start the local server
   - Use the local API endpoint (typically `http://localhost:1234/v1`)

3. **Self-hosted OpenAI-compatible APIs**:
   - [vLLM](https://github.com/vllm-project/vllm)
   - [LocalAI](https://github.com/localai/localai)
   - [llama.cpp server](https://github.com/ggerganov/llama.cpp/tree/master/examples/server)

## Troubleshooting

If you encounter issues with your LLM integration:

- Check that your API endpoint is correct and the service is running
- Verify your API key is valid (for OpenAI)
- For local models, ensure sufficient hardware resources
- Try adjusting the temperature setting (lower values = more predictable responses)
- Use the "Test Settings" button to check your configuration
- Examine the application logs for detailed error messages

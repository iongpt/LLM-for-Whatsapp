For a very quick setup, I recommend [Oobabooga with OpenAI extension](https://github.com/oobabooga/text-generation-webui/wiki/12-%E2%80%90-OpenAI-API) 
and as a model, for English, I recommend [Mistral 7B](https://huggingface.co/mistralai/Mistral-7B-v0.1).

#Steps

1. Install booga, using this: https://github.com/oobabooga/text-generation-webui?tab=readme-ov-file#how-to-install
2. Navigate to the folder where you installed booga and edit CMD_FLAGS.tx file. Add `--share  --listen --api` to it. `--share` is needed only if you run booga on a different machine. If it runs on the same machine as this app, is not required, can use the localhost links.
3. Start booga using the script for your OS
4. Navigate with the browser to the UI, go to models and download one from HF. You just have to insert the user/model_name and click download. For example, to download this model: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1 you insert mistralai/Mistral-7B-Instruct-v0.1 in the field and click download
5. Go to Session (last menu option) and on the extensions list check openai
6. Stop booga and start it again. Now, when it will start you will get something like this: OPENAI_API_BASE=https://cvillas-lsd-avi-iso.trycloudflare.com/v1. You need to copy that URL (without OPENAI_API_BASE) into the LLM Settings section of the application. On some booga versions it will not be OPENAI_API_BASE, but it will be "OpenAI API compatible url". Please note that on Windows the url is called somehing else
7. Now, you can have your local model chatting with your contacts via Whatsapp

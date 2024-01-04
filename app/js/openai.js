const OpenAI = require('openai');

const fs = require("fs");
const path = require('path');

function readSettings() {
    const settingsFilePath = path.join(__dirname, '..', 'settings.json');
    console.log("settingsFilePath", settingsFilePath);
    if (fs.existsSync(settingsFilePath)) {
        const settings = JSON.parse(fs.readFileSync(settingsFilePath));
        console.log("settings", settings);
        return settings;
    } else {
        throw new Error('Settings file not found.');
    }
}

const stallMessages = [
    "I'm not quite sure I follow. Could you elaborate on that?",
    "Can you please explain that in a bit more detail?",
    "I'm sorry, I'm still a bit confused. Can we go over that again?",
    "That's interesting. Can you tell me more about it?",
    "How exactly does that work?",
    "I'm curious to understand more about this. Can you elaborate?",
    "Could you clarify what you mean by that?",
    "I want to make sure I'm understanding you correctly. Can you rephrase that?",
    "Hmm, that's a bit unclear to me. Can you break it down a bit more?",
    "That sounds important. Could you expand on that point?",
    "I see, but I'm still a little unclear about one thing. Can you explain further?",
    "Can you give me an example to illustrate that?",
    "I'm trying to wrap my head around this. Can you help me out?",
    "That's a new concept to me. How does it work exactly?",
    "I'd like to delve deeper into this topic. Can you provide more information?",
    "Could you walk me through that step by step?",
    "I'm eager to understand this better. Can you simplify it for me?",
    "That raises an interesting point. Can you go into more detail?",
    "I'm still piecing this together. Can you help clarify a few things?",
    "This seems important. Can you explain it in layman's terms?",
];

function getRandomStallMessage() {
    const randomIndex = Math.floor(Math.random() * stallMessages.length);
    return stallMessages[randomIndex];
}


async function getLLMMessage(messages) {
    let settings;
    try {
        settings = readSettings();
    } catch (error) {
        console.error('Error reading settings:', error);
        return getRandomStallMessage();
    }

    if (messages.length === 0 || messages[0].role !== "system") {
        messages.unshift({ role: "system", content: settings.systemPrompt });
    }

    try {
        // Check if openaiKey and openaiModel are present in the settings
        if (settings.openaiKey && settings.openaiModel) {
            return await getOpenAIResponse(messages, settings.openaiKey, settings.openaiModel);
        }
        // If openaiKey is not present, but openaiApiEndpoint is, use a custom LLM
        else if (settings.openaiApiEndpoint) {
            return await getCustomOpenAIResponse(messages, settings.openaiApiEndpoint);
        } else {
            console.log('Required OpenAI settings not found.');
            return getRandomStallMessage();
        }
    } catch (error) {
        console.log('Error processing LLM message:', error);
        return getRandomStallMessage();
    }
}


async function getOpenAIResponse(messages, apiKey, modelName) {
    console.log("Using custom ChatGPT")

    const openai = new OpenAI({
        apiKey: apiKey
    });

    try {
        const response = await openai.chat.completions.create({
            model: modelName,
            messages: messages
        });
        console.log("response", response);
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return getRandomStallMessage();
    }
}


async function getCustomOpenAIResponse(messages, apiUrl) {
    console.log("Using custom LLM")
    const openai = new OpenAI({
        baseURL: apiUrl,
        apiKey: "dummy"
    });

    try {
        const response = await openai.chat.completions.create({
            messages: messages
        });
        console.log("response", response);
        return response.choices[0].message.content;
    } catch (error) {
        console.log('Error calling OpenAI API:', error);
        return getRandomStallMessage();
    }
}

module.exports = { getLLMMessage };
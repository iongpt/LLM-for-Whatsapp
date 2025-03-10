const OpenAI = require('openai');

const fs = require("fs");
const path = require('path');

// For testing purposes
let openAIInstance = null;

function readSettings() {
    try {
        // If running in a test environment, use mock settings
        if (process.env.NODE_ENV === 'test' && global.mockSettings) {
            return global.mockSettings;
        }
        
        const settingsFilePath = path.join(__dirname, '..', 'settings.json');
        console.log("settingsFilePath", settingsFilePath);
        if (fs.existsSync(settingsFilePath)) {
            const settings = JSON.parse(fs.readFileSync(settingsFilePath));
            console.log("settings", settings);
            return settings;
        } else {
            throw new Error('Settings file not found.');
        }
    } catch (error) {
        console.error('Error reading settings:', error);
        throw error;
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

// For testing - trim messages to context length
function trimMessages(messages, maxLength) {
    if (!messages || messages.length === 0) return [];
    if (maxLength <= 0) return [];
    
    if (messages.length <= maxLength) return messages;
    
    // Always keep the system message if present
    if (messages[0].role === 'system') {
        if (maxLength === 1) return [messages[0]];
        return [messages[0], ...messages.slice(-(maxLength-1))];
    }
    
    return messages.slice(-maxLength);
}

// For testing - format WhatsApp messages for LLM
function formatMessagesForLLM(whatsappMessages, systemPrompt) {
    if (!whatsappMessages || whatsappMessages.length === 0) {
        return [{role: 'system', content: systemPrompt}];
    }
    
    const formattedMessages = [{role: 'system', content: systemPrompt}];
    
    whatsappMessages.forEach(msg => {
        if (msg.fromMe) {
            formattedMessages.push({role: 'assistant', content: msg.body});
        } else {
            formattedMessages.push({role: 'user', content: msg.body});
        }
    });
    
    return formattedMessages;
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
        // For testing - use the sendMessageToLLM function if available
        if (process.env.NODE_ENV === 'test') {
            return await sendMessageToLLM(messages);
        }
        
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
    console.log("Using OpenAI ChatGPT");

    if (!openAIInstance) {
        openAIInstance = new OpenAI({
            apiKey: apiKey
        });
    }

    try {
        const response = await openAIInstance.chat.completions.create({
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
    console.log("Using custom LLM");
    
    if (!openAIInstance) {
        openAIInstance = new OpenAI({
            baseURL: apiUrl,
            apiKey: "dummy"
        });
    }

    try {
        const response = await openAIInstance.chat.completions.create({
            messages: messages
        });
        console.log("response", response);
        return response.choices[0].message.content;
    } catch (error) {
        console.log('Error calling OpenAI API:', error);
        return getRandomStallMessage();
    }
}

// For testing - direct access to LLM API
async function sendMessageToLLM(messageHistory) {
    try {
        if (!openAIInstance) {
            // Create an instance with mock or real settings
            const settings = readSettings();
            openAIInstance = new OpenAI({
                apiKey: settings.openaiKey || 'dummy-key',
                ...(settings.openaiApiEndpoint ? { baseURL: settings.openaiApiEndpoint } : {})
            });
        }
        
        const completion = await openAIInstance.chat.completions.create({
            model: readSettings().openaiModel || 'gpt-3.5-turbo',
            messages: messageHistory,
        });
        
        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error calling LLM API:', error);
        return `Error: ${error.message || 'Unknown error occurred'}`;
    }
}

// For testing - access the OpenAI instance
function getOpenAIInstance() {
    return openAIInstance;
}

module.exports = { 
    getLLMMessage,
    // Export additional functions for testing
    trimMessages,
    formatMessagesForLLM,
    sendMessageToLLM,
    getOpenAIInstance
};
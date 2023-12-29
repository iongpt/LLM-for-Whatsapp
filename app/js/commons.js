
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");

function readSettings() {
    const settingsFilePath = path.join(__dirname, '..', 'settings.json');
    console.log("settingsFilePath", settingsFilePath);
    if (fs.existsSync(settingsFilePath)) {
        const settings = JSON.parse(fs.readFileSync(settingsFilePath));
        // if (!settings.openaiKey || !settings.openaiApiEndpoint) {
        //     throw new Error('OpenAI key and API endpoint are required.');
        // }
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


async function getOpenAIResponse(messages) {
    const configuration = new Configuration({
        apiKey: settings.openaiKey,
    });
    const openai = new OpenAIApi(configuration);

    try {
        const response = await openai.createChatCompletion({
            model: settings.openaiModel,
            messages: messages,
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return getRandomStallMessage();
    }
}

function addMessageToContact(contactId, role, content) {
    const contact = global.fullContacts.find(c => c.id === contactId);
    if (contact) {
        contact.messages.push({ role, content });
        trimMessages(contact);
    }
}

function addSystemMessageToContact(contactId) {
    const settingsFilePath = path.join(__dirname, 'settings.json');
    if (!fs.existsSync(settingsFilePath)) {
        console.error('Settings file not found.');
        return;
    }

    const settings = JSON.parse(fs.readFileSync(settingsFilePath));
    const systemMessage = settings.systemPrompt;

    const contact = global.fullContacts.find(c => c.id === contactId);
    if (contact) {
        contact.messages = [{ role: "system", content: systemMessage }];
        trimMessages(contact);
    }
}


function trimMessages(contact) {
    let totalChars = contact.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    // Always keep the system message
    let systemMessage = contact.messages.find(m => m.role === 'system');

    while (totalChars > 4000 && contact.messages.length > 1) {
        // Skip the first message if it's the system message
        if (contact.messages[0].role === 'system') {
            contact.messages.splice(1, 1);
        } else {
            contact.messages.shift();
        }
        totalChars = contact.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    }

    // Ensure the system message is always at the beginning
    if (systemMessage) {
        contact.messages = [systemMessage, ...contact.messages.filter(m => m.role !== 'system')];
    }
}

function sendMessage(contactId, messageContent) {
    addMessageToContact(contactId, "assistant", messageContent);
}


module.exports = {
    readSettings,
    addSystemMessageToContact,

}
require('dotenv').config();

const Groq = require('groq-sdk');

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function testGroqAPI() {
    try {
        const chatCompletion = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: 'Confirm the API is working for 2026.',
                },
            ],
        });

        console.log('API Response:');
        console.log(chatCompletion.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error);
    }
}

testGroqAPI();

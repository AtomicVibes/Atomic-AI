const dotenv = require('dotenv');
dotenv.config();

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let conversationHistory = [];

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { message: userMessage } = JSON.parse(event.body);

    conversationHistory.push({ role: 'user', content: userMessage });

    const chatCompletion = await groq.chat.completions.create({
      messages: conversationHistory,
      model: 'llama3-8b-8192',
    });

    const modelResponse = chatCompletion.choices[0]?.message?.content || '';

    conversationHistory.push({ role: 'assistant', content: modelResponse });

    return {
      statusCode: 200,
      body: JSON.stringify({ response: modelResponse }),
    };
  } catch (error) {
    console.error('Error fetching chat completion:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get chat completion' }),
    };
  }
};

const dotenv = require('dotenv');
dotenv.config();

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let conversationHistory = [];

exports.handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // Be more specific in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    console.log('Received event:', JSON.stringify(event));
    const { message: userMessage } = JSON.parse(event.body);
    console.log('Received message:', userMessage);

    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }

    conversationHistory.push({ role: 'user', content: userMessage });
    console.log('Conversation history:', JSON.stringify(conversationHistory));

    const chatCompletion = await groq.chat.completions.create({
      messages: conversationHistory,
      model: 'llama3-8b-8192',
      max_tokens: 1000, // Adjust as needed
      temperature: 0.7, // Adjust as needed
    });

    const modelResponse = chatCompletion.choices[0]?.message?.content || '';
    console.log('Model response:', modelResponse);

    conversationHistory.push({ role: 'assistant', content: modelResponse });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: modelResponse }),
    };
  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Failed to get chat completion: ${error.message}` }),
    };
  }
};

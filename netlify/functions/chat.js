import dotenv from 'dotenv';
dotenv.config();

import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let conversationHistory = [];

// Serverless function for /chat
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { message: userMessage } = JSON.parse(event.body);

    // Add user's message to the conversation history
    conversationHistory.push({ role: 'user', content: userMessage });

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: conversationHistory,
      model: 'llama3-8b-8192',
    });

    const modelResponse = chatCompletion.choices[0]?.message?.content || '';

    // Add assistant's response to the conversation history
    conversationHistory.push({ role: 'assistant', content: modelResponse });

    return {
      statusCode: 200,
      body: JSON.stringify({ response: modelResponse }),
    };
  } catch (error) {
    console.error('Error fetching chat completion:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get chat completion' }),
    };
  }
}

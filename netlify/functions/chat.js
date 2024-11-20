const dotenv = require('dotenv');
dotenv.config();

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let conversationHistory = [];

exports.handler = async (event) => {
  // CORS headers for allowing cross-origin requests
  const headers = {
    'Access-Control-Allow-Origin': '*', // Change to a specific domain in production for security
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle OPTIONS preflight requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);  // Log the method for debugging
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    console.log('Received event:', JSON.stringify(event)); // Log the entire event for debugging
    const { message: userMessage } = JSON.parse(event.body); // Extract message from the body
    console.log('Received message:', userMessage);

    // Check if the API key is set
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing!');
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }

    // Append the user's message to conversation history
    conversationHistory.push({ role: 'user', content: userMessage });
    console.log('Conversation history:', JSON.stringify(conversationHistory)); // Log conversation history

    // Call the Groq API to get the AI response
    const chatCompletion = await groq.chat.completions.create({
      messages: conversationHistory,
      model: 'llama3-8b-8192',
      max_tokens: 1000, // Adjust as needed
      temperature: 0.7, // Adjust as needed
    });

    const modelResponse = chatCompletion.choices[0]?.message?.content || ''; // Extract response content
    console.log('Model response:', modelResponse); // Log the model response

    // Append the AI's response to the conversation history
    conversationHistory.push({ role: 'assistant', content: modelResponse });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: modelResponse }), // Return the AI response
    };
  } catch (error) {
    // Log error details for debugging
    console.error('Error details:', error);
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

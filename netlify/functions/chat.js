const dotenv = require('dotenv');
dotenv.config();

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.message;

    // Define conversation history (can be enhanced with caching)
    let conversationHistory = [];
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
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process chat completion' }),
    };
  }
};

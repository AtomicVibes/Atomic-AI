import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import Groq from 'groq-sdk';

// Groq API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// serveur express eli y5ademlk el front 3al port 3000
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Structure 

let conversationHistory = [];

// Khadija don't mess with this part ;p

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    conversationHistory.push({ role: 'user', content: userMessage });

    const chatCompletion = await groq.chat.completions.create({
      messages: conversationHistory,
      model: 'llama3-8b-8192',
    });

    const modelResponse = chatCompletion.choices[0]?.message?.content || "";

    conversationHistory.push({ role: 'assistant', content: modelResponse });

    res.json({ response: modelResponse });
  } catch (error) {
    console.error('Error fetching chat completion:', error);
    res.status(500).json({ error: 'Failed to get chat completion' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

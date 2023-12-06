const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const ChatMessage = require('./models/ChatMessage');



const axios = require('axios')

require('dotenv').config();
app.use(express.json());
app.use(cors());

const initialPrompt = "You are a helpful assistant knowledgeable in teaching Japanese, sensei. You provide informative and accurate responses to questions about the Japanese language, culture, and learning resources. Keep Conversations to being about Japanese, or bring them back to Japanese as a topic at all times. Replies should always include some Japanese, and also English. Do answers questions not about Japanese, and instead redirect the conversation to Japanese using English and Japanese.";



const port = process.env.PORT || 3000;

//mongodb://127.0.0.1:27017/NihongoGPT

const mongoDBUri = 'mongodb://127.0.0.1:27017/NihongoGPT';


mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.get('/', (req, res) => {
  res.send('Hello, NihongoGPT!');
});

app.get('/messages', async(req, res) => {
    try {
        const messages = await ChatMessage.find();
        res.json(messages)
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

app.post('/', (req, res) => {
     const message = new ChatMessage({
        message: req.body.message,
        isUser: req.body.isUser,
     })
})

// Route for logging

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user in the database based on the email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate a JWT token for authentication
    const token = generateToken(user);
    console.log("Successfully login!")
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});



app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const conversationHistory = req.body.history || []; // Array of past messages

    // Add the initial prompt if the conversation is just starting
    if (conversationHistory.length === 0) {
      conversationHistory.push({ role: "system", content: initialPrompt });
    }

    // Add the user's message to the conversation history
    conversationHistory.push({ role: "user", content: userMessage });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: conversationHistory,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract the AI's response and add it to the conversation history
    const aiResponse = response.data.choices[0].message.content.trim();
    conversationHistory.push({ role: "assistant", content: aiResponse });

    res.json({ message: aiResponse, history: conversationHistory });
  } catch (error) {
    console.error('Error calling OpenAI:', error.response ? error.response.data : error);
    res.status(500).send('Error processing your message');
  }
});




app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

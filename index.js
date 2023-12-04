const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const ChatMessage = require('./models/ChatMessage');

const axios = require('axios')

require('dotenv').config();
app.use(express.json());
app.use(cors());


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


app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions', // Updated endpoint for chat models
      {
        model: "gpt-3.5-turbo", // Specify the model
        messages: [{ role: "user", content: userMessage }], // Format for chat endpoint
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(response.data.choices[0].message.content.trim())
    res.json({ message: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error calling OpenAI:', error.response ? error.response.data : error);
    res.status(500).send('Error processing your message');
  }
});





app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

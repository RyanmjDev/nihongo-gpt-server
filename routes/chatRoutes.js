const express = require('express');
const router = express.Router();
const axios = require('axios');

const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const auth = require('../utils/auth');

require('dotenv').config();

const initialPrompt = require('../prompts/initialPrompt');


router.get('/', async (req, res) => {
    try {
        const messages = await ChatMessage.find();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const userMessage = req.body.message;
        console.log(userMessage);

        const conversationHistory = req.body.history || []; 

        if (conversationHistory.length === 0) {
          conversationHistory.push({ role: "system", content: initialPrompt });
        }

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

        const aiResponse = response.data.choices[0].message.content.trim();
        conversationHistory.push({ role: "assistant", content: aiResponse });

        
        // Create and save user message
        const userChatMessage = new ChatMessage({ message: userMessage, isUser: true });
        await userChatMessage.save();
        user.chatMessages.push(userChatMessage._id);

        // Create and save AI response
        const aiChatMessage = new ChatMessage({ message: aiResponse, isUser: false });
        await aiChatMessage.save();
        user.chatMessages.push(aiChatMessage._id);

        await user.save();


        res.json({ message: aiResponse, history: conversationHistory });
      } catch (error) {
        console.error('Error calling OpenAI:', error.response ? error.response.data : error);
        res.status(500).send('Error processing your message');
      }
});

module.exports = router;

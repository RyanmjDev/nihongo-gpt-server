const express = require('express');
const router = express.Router();
const axios = require('axios');

const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');


require('dotenv').config();

const initialPrompt = require('../prompts/initialPrompt');


exports.getMessages = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const limit = parseInt(req.query.limit) || 20;  
      const page = parseInt(req.query.page) || 1;
  
      const messages = await ChatMessage.find({ _id: { $in: user.chatMessages } })
                                        .sort({ createdAt: -1 }) 
                                        .skip((page - 1) * limit)
                                        .limit(limit)
                                        .exec();
                                    
  
      res.json(messages);
    } catch (error) {
      console.log("Error fetching messages:", error);
      res.status(500).json({ message: error.message });
    }
  };

exports.postMessage = async (req, res) => {
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
}

exports.deleteMessage = async (req, res) => {
}

exports.deleteAllMessages = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        // Delete all chat messages associated with the user
        await ChatMessage.deleteMany({ _id: { $in: user.chatMessages } });
    
        // Clear the user's notes array. COME BACK TO THIS!
        user.notes = [];
        await user.save();
    
        res.json({ message: "Chat history deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}

exports.getNotes = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            console.log("User not found with ID:", req.user._id);
            return res.status(404).json({ message: "User not found" });
        }
  
        console.log("User's notes ObjectIds:", user.notes);
  
        const notes = await ChatMessage.find({ _id: { $in: user.notes } });
  
        // Check if notes array is empty after the query
        if (notes.length === 0) {
            console.log("No ChatMessage documents found for provided ObjectIds in user.notes");
        }
  
        console.log("Fetched notes:", notes);
  
        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ message: error.message });
    }
}

exports.saveNote = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
  
        const note = req.body.message;
        const noteMessage = new ChatMessage({ message: note, isUser: false });
        await noteMessage.save();
        user.notes.push(noteMessage._id);
        await user.save();
  
        console.log("note saved: ", noteMessage);
        res.json(noteMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteNote = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        const noteId = req.params.noteId;
    
        // Find the index of the note in the user's notes array
        const noteIndex = user.notes.indexOf(noteId);
    
        // If the note is not found in the user's notes array, return an error
        if (noteIndex === -1) {
          return res.status(404).json({ message: "Note not found" });
        }
    
        // Remove the note from the user's notes array
        user.notes.splice(noteIndex, 1);
    
        // Save the updated user object
        await user.save();
    
        res.json({ message: "Note removed successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}